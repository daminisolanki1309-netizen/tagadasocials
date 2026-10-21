"""Builds the daily feed of bangers from the scan files, newest first, never repeating a link.

python3 -I feed.py <scan dir> <feed dir>

Reads x.json, li.json and ig.json from <scan dir> (written by run.sh xscan/liscan/igscan), plus
li_creators.json and tt.json when present (LinkedIn creators' posts and TikTok videos, written by
run.sh postscan or ttfind), keeps posts from the last 48 hours that beat their own account's usual
post, drops Tagada's own accounts, news accounts and anything already sent in an earlier feed
(<feed dir>/sent.txt), re-checks every link with run.sh check, and writes <feed dir>/latest.json
and ../latest-links.md.

Accounts in notion/db/watchlist-creative.csv (brands known for their social creativity, creators
and thought leaders) also qualify at 2x their usual post, as "Creative": they are consistently
strong, so they rarely triple their own median.
"""
import json
import os
import subprocess
import tempfile
import sys
from datetime import datetime, timezone

HOURS = 48
MIN_SCORE = {'X': 3.0, 'LinkedIn': 2.5, 'Instagram': 3.0, 'TikTok': 3.0}
CREATIVE = 2.0  # creative brands and creators: 2x their usual post is already a standout
TIKTOK_VIEWS = 500_000  # a TikTok video with this many views in 48 hours counts even without a baseline
RISING = 2.0  # under 24 hours old and already at 2x: still climbing, shown as Rising
MIN_ENGAGEMENT = {'X': 50, 'LinkedIn': 40, 'Instagram': 200, 'TikTok': 20_000}
PER_PLATFORM = 25
PER_ACCOUNT = 2  # keeps one account from filling the feed
OWN = {'jointagadapay', 'jointagada', 'tagadapay', 'tagada'}
# Entertainment accounts stay in the watchlist for format ideas but never go in the feed.
SKIP = {'mrbeast', 'netflix'}
# Prediction markets spike on every headline; their posts are news, not creativity. Format only.
NEWS = {'polymarket', 'kalshi'}

scan_dir, feed_dir = sys.argv[1], sys.argv[2]
engine = os.path.dirname(os.path.abspath(__file__))
now = datetime.now(timezone.utc)
os.makedirs(feed_dir, exist_ok=True)
sent_path = os.path.join(feed_dir, 'sent.txt')


def norm(url):
    # One spelling per post: no tracking query (except the Ad Library's ?id=) and no trailing slash.
    if 'facebook.com/ads/library' not in url:
        url = url.split('?')[0].split('#')[0]
    return url.rstrip('/')


creative_path = os.path.join(engine, '..', 'notion', 'db', 'watchlist-creative.csv')
creative = set()
if os.path.exists(creative_path):
    import csv
    creative = {r['handle'].lstrip('@').lower() for r in csv.DictReader(open(creative_path))}

sent = {norm(u) for u in open(sent_path).read().split()} if os.path.exists(sent_path) else set()


def load(name):
    path = os.path.join(scan_dir, name)
    return json.load(open(path)) if os.path.exists(path) else []


def hours_old(post):
    if post.get('posted'):
        return (now - datetime.fromisoformat(post['posted'].replace('Z', '+00:00'))).total_seconds() / 3600
    if post.get('ageDays') is not None:
        return post['ageDays'] * 24
    return None


candidates = []
for platform, name in (('X', 'x.json'), ('LinkedIn', 'li.json'), ('LinkedIn', 'li_creators.json'), ('Instagram', 'ig.json'), ('TikTok', 'tt.json')):
    for acc in load(name):
        if not acc or acc.get('error') or (acc.get('account') or '').lower() in OWN | SKIP | NEWS:
            continue
        for p in acc.get('posts', []):
            age = hours_old(p)
            if age is None or age > HOURS or norm(p['url']) in sent:
                continue
            score = p.get('outlier') or 0
            if (p.get('engagement') or 0) < MIN_ENGAGEMENT[platform]:
                continue
            is_creative = (acc.get('account') or '').lower() in creative or name == 'li_creators.json'
            if score >= MIN_SCORE[platform]:
                tier = 'Banger'
            elif platform == 'TikTok' and (p.get('views') or 0) >= TIKTOK_VIEWS:
                tier = 'Banger'
            elif is_creative and score >= CREATIVE:
                tier = 'Creative'
            elif score >= RISING and age <= 24:
                tier = 'Rising'
            else:
                continue
            candidates.append({
                'platform': platform, 'account': acc['account'], 'profile': acc['profile'], 'url': p['url'],
                'tier': tier, 'score': p.get('outlier') or 0, 'hours_old': round(age, 1), 'likes': p.get('likes'), 'replies': p.get('replies'),
                'reposts': p.get('reposts'), 'views': p.get('views'), 'text': (p.get('text') or '').strip()[:280],
            })

# Newer is better: a post from the last 24 hours ranks ahead of an older one unless the older
# one scores at least twice as high.
for c in candidates:
    c['rank'] = (c['score'] or 0) * (2 if c['hours_old'] <= 24 else 1) + (5 if c['tier'] == 'Creative' else 0)
picked = []
for platform in MIN_SCORE:
    rows = sorted((c for c in candidates if c['platform'] == platform), key=lambda c: -c['rank'])
    per_account = {}
    kept = []
    for c in rows:
        if per_account.get(c['account'], 0) >= PER_ACCOUNT:
            continue
        per_account[c['account']] = per_account.get(c['account'], 0) + 1
        kept.append(c)
    picked += kept[:PER_PLATFORM]

# Re-check every link right before publishing; only links that open go out.
work = tempfile.mkdtemp(prefix='feed-')
urls = os.path.join(work, 'urls.txt')
check = os.path.join(work, 'check.json')
open(urls, 'w').write('\n'.join(c['url'] for c in picked) + '\n')
if picked:
    subprocess.run([os.path.join(engine, 'run.sh'), 'check', check, urls], check=False)
    status = {r['url']: r for r in json.load(open(check))} if os.path.exists(check) else {}
else:
    status = {}
live = []
for c in picked:
    r = status.get(c['url'], {})
    if r.get('status') != 'Opens':
        continue
    for k in ('likes', 'replies'):
        if r.get(k) is not None:
            c[k] = r[k]
    live.append(c)

feed = {'built': now.isoformat(timespec='minutes'), 'window_hours': HOURS, 'count': len(live), 'posts': live}
json.dump(feed, open(os.path.join(feed_dir, 'latest.json'), 'w'), indent=1, ensure_ascii=False)
with open(sent_path, 'a') as f:
    for c in live:
        f.write(norm(c['url']) + '\n')


def age_label(h):
    return f'{round(h)}h old' if h < 48 else f'{round(h / 24)}d old'


lines = [f'# Latest bangers, built {now:%b %-d, %Y %H:%M} UTC', '',
         f'Posts from the last {HOURS} hours that beat their own account\'s usual post, newest ranked first. Banger = 3x or more (2.5x on LinkedIn; on TikTok also any video over {TIKTOK_VIEWS:,} views). Creative = a brand known for its social creativity, a creator or a thought leader at 2x or more. Rising = under 24 hours old and already 2x, still climbing. News accounts (prediction markets) are left out. '
         'Every link was re-checked when this file was built and opened. Links here never appear in a later feed.', '']
for platform in MIN_SCORE:
    rows = [c for c in live if c['platform'] == platform]
    lines += [f'## {platform}', '']
    if not rows:
        lines += ['Nothing cleared the bar in the last 48 hours.', '']
        continue
    lines += ['| Score | Age | Tier | Post | Profile | Numbers |', '| --- | --- | --- | --- | --- | --- |']
    for c in rows:
        nums = ', '.join(f'{v:,} {k}' for k, v in (('views', c.get('views')), ('likes', c['likes']), ('replies', c['replies']), ('reposts', c['reposts'])) if v)
        lines.append(f"| {c['score']}x | {age_label(c['hours_old'])} | {c['tier']} | {c['url']} | {c['profile']} | {nums} |")
    lines.append('')
open(os.path.join(os.path.dirname(feed_dir.rstrip('/')), 'latest-links.md'), 'w').write('\n'.join(lines))
print(f'{len(live)} posts in the feed ({len(candidates)} candidates, {len(picked) - len(live)} failed the re-check)')
