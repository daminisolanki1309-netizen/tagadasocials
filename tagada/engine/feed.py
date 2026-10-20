"""Builds the daily feed of bangers from the scan files, newest first, never repeating a link.

python3 -I feed.py <scan dir> <feed dir>

Reads x.json, li.json and ig.json from <scan dir> (written by run.sh xscan/liscan/igscan),
keeps posts from the last 48 hours that beat their own account's usual post, drops Tagada's
own accounts and anything already sent in an earlier feed (<feed dir>/sent.txt), re-checks
every link with run.sh check, and writes <feed dir>/latest.json and ../latest-links.md.
"""
import json
import os
import subprocess
import tempfile
import sys
from datetime import datetime, timezone

HOURS = 48
MIN_SCORE = {'X': 3.0, 'LinkedIn': 2.5, 'Instagram': 3.0}
RISING = 2.0  # under 24 hours old and already at 2x: still climbing, shown as Rising
MIN_ENGAGEMENT = {'X': 50, 'LinkedIn': 40, 'Instagram': 200}
PER_PLATFORM = 25
PER_ACCOUNT = 2  # keeps one account from filling the feed
OWN = {'jointagadapay', 'jointagada', 'tagadapay', 'tagada'}
# Entertainment accounts stay in the watchlist for format ideas but never go in the feed.
SKIP = {'mrbeast', 'netflix'}

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
for platform, name in (('X', 'x.json'), ('LinkedIn', 'li.json'), ('Instagram', 'ig.json')):
    for acc in load(name):
        if not acc or acc.get('error') or acc.get('account', '').lower() in OWN | SKIP:
            continue
        for p in acc.get('posts', []):
            age = hours_old(p)
            if age is None or age > HOURS or norm(p['url']) in sent:
                continue
            score = p.get('outlier') or 0
            if (p.get('engagement') or 0) < MIN_ENGAGEMENT[platform]:
                continue
            if score >= MIN_SCORE[platform]:
                tier = 'Banger'
            elif score >= RISING and age <= 24:
                tier = 'Rising'
            else:
                continue
            candidates.append({
                'platform': platform, 'account': acc['account'], 'profile': acc['profile'], 'url': p['url'],
                'tier': tier, 'score': p['outlier'], 'hours_old': round(age, 1), 'likes': p.get('likes'), 'replies': p.get('replies'),
                'reposts': p.get('reposts'), 'text': (p.get('text') or '').strip()[:280],
            })

# Newer is better: a post from the last 24 hours ranks ahead of an older one unless the older
# one scores at least twice as high.
for c in candidates:
    c['rank'] = c['score'] * (2 if c['hours_old'] <= 24 else 1)
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
         f'Posts from the last {HOURS} hours that beat their own account\'s usual post, newest ranked first. Banger = 3x or more (2.5x on LinkedIn). Rising = under 24 hours old and already 2x, still climbing. '
         'Every link was re-checked when this file was built and opened. Links here never appear in a later feed.', '']
for platform in MIN_SCORE:
    rows = [c for c in live if c['platform'] == platform]
    lines += [f'## {platform}', '']
    if not rows:
        lines += ['Nothing cleared the bar in the last 48 hours.', '']
        continue
    lines += ['| Score | Age | Tier | Post | Profile | Numbers |', '| --- | --- | --- | --- | --- | --- |']
    for c in rows:
        nums = ', '.join(f'{v:,} {k}' for k, v in (('likes', c['likes']), ('replies', c['replies']), ('reposts', c['reposts'])) if v)
        lines.append(f"| {c['score']}x | {age_label(c['hours_old'])} | {c['tier']} | {c['url']} | {c['profile']} | {nums} |")
    lines.append('')
open(os.path.join(os.path.dirname(feed_dir.rstrip('/')), 'latest-links.md'), 'w').write('\n'.join(lines))
print(f'{len(live)} posts in the feed ({len(candidates)} candidates, {len(picked) - len(live)} failed the re-check)')
