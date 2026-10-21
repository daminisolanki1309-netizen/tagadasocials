"""Builds the scan lists from every watchlist, one handle per account, no duplicates.

python3 -I handles.py <notion/db dir> <out dir>

Writes x.txt, li.txt, ig.txt, tt.txt (space-separated handles for run.sh xscan/liscan/igscan/ttscan) from
watchlist.csv (columns "X handle", "Instagram handle", and the slug in "LinkedIn page"),
watchlist-extra.csv and watchlist-creative.csv (platform,handle), plus Tagada's own accounts.
"""
import csv
import os
import re
import sys

db, out = sys.argv[1], sys.argv[2]
lists = {'x': [], 'li': [], 'ig': [], 'tt': []}


def add(key, handle):
    h = handle.strip().lstrip('@')
    if h and h.lower() not in {v.lower() for v in lists[key]}:
        lists[key].append(h)


for r in csv.DictReader(open(os.path.join(db, 'watchlist.csv'))):
    x = r.get('X handle', '').strip()
    if x.startswith('@') and (m := re.match(r'@([A-Za-z0-9_]{1,15})\b', x)):
        add('x', m.group(1))
    if m := re.match(r'@([A-Za-z0-9_.]+)', r.get('Instagram handle', '').strip()):
        add('ig', m.group(1))
    if m := re.search(r'linkedin\.com/company/([^/?\s]+)', r.get('LinkedIn page', '')):
        add('li', m.group(1))
for name in ('watchlist-extra.csv', 'watchlist-creative.csv'):
    path = os.path.join(db, name)
    if os.path.exists(path):
        for r in csv.DictReader(open(path)):
            key = {'x': 'x', 'linkedin': 'li', 'instagram': 'ig', 'tiktok': 'tt'}.get(r['platform'].strip().lower())
            if key:
                add(key, r['handle'])
for key, own in (('x', 'JoinTagadaPay'), ('li', 'jointagada'), ('ig', 'tagadapay')):
    add(key, own)
os.makedirs(out, exist_ok=True)
for key, handles in lists.items():
    open(os.path.join(out, f'{key}.txt'), 'w').write(' '.join(handles))
print({k: len(v) for k, v in lists.items()})
