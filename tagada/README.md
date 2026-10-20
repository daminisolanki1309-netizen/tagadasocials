# Tagada swipe engine

Finds the posts that are beating their own account's usual numbers on X, LinkedIn, Instagram and Meta ads, checks every link, screenshots each post, and feeds the results into the Tagada Social Research hub in Notion, where the weekly swipes for Tagada, TagadaPay and TagadaRx are written.

Everything here uses free, public, no-login sources. No API keys.

## Where the output lives (Notion)

| What | Notion |
| --- | --- |
| Hub | Tagada Social Research |
| Every outlier post, by week | Swipe File (view: **By week**) |
| Accounts tracked | Watchlist |
| Merchant quotes | Voice of Customer |
| Weekly pages | Weekly Swipe Drops |
| Paste a calendar here | Calendar Inbox: paste a calendar here |
| One row per planned post | Content Calendar |

## How each platform is read

| Platform | Source | What comes back | Limits seen on Oct 18, 2026 |
| --- | --- | --- | --- |
| X, one post | `cdn.syndication.twimg.com/tweet-result` (the public embed data) | text, author, date, likes, replies | none |
| X, an account's recent posts | `syndication.twitter.com/srv/timeline-profile/screen-name/<handle>` in a real browser | up to 100 recent posts with likes, replies, reposts | rate limit after ~30 accounts in a few minutes; the scan waits 25s between accounts |
| LinkedIn company page | public company page in a real browser, one fresh session per company | ~10 recent posts with reactions and comments | login wall if many pages load in one session; personal profiles always need a login |
| LinkedIn, one post | public post page | author, reactions, comments, text | none |
| Instagram, one post | `/p/<code>/embed/captioned/`, falling back to the post page's preview data when embedding is off (collab reels) | author, likes, comments, caption, date | none |
| Instagram, an account's recent posts | the public profile embed, `instagram.com/<user>/embed/` | the 6 newest posts with likes, comments, caption, date | none seen; `web_profile_info` is kept as a fallback but gets 429 from cloud IPs |
| Meta ads | facebook.com/ads/library in a real browser | active US ads, start date, days running, copy | none |
| Trustpilot, Shopify Community, any web page | real browser | text, status | Trustpilot and Reddit answer 403 to plain requests but render in the browser |

**Outlier score** = the post's engagement divided by that account's median post. Engagement = likes + 2 x replies + 3 x reposts. Instagram reels use views when available. Meta ads have no public engagement, so they are ranked by days running.

**Backups.** Each saved post gets: the original link, the profile link, a no-login view (the platform's own embed page), a screenshot stored in its Notion row, and a Wayback Machine link when a snapshot exists. Save Page Now refuses this server, so new snapshots are not created unless `WAYBACK_SAVE=1` is set and it works from where you run it.

## Running it

Needs Node with Playwright and Chromium (`/opt/pw-browsers` in Claude Code cloud sessions) and Python 3 with Pillow. In cloud sessions `python3` is 3.11 while the system Pillow is built for 3.12, so `engine/setup.sh` (a SessionStart hook in `.claude/settings.json`) installs a matching Pillow when `from PIL import Image` fails. Network access must allow x.com, twimg.com, twitter.com, instagram.com, linkedin.com, facebook.com, archive.org, trustpilot.com, reddit.com and community.shopify.com.

```bash
cd engine
./run.sh xscan    ../out/x.json    tryramp Wendys duolingo ...
./run.sh liscan   ../out/li.json   ramp klaviyo jointagada ...
./run.sh igscan   ../out/ig.json   wendys duolingo ...
./run.sh metascan ../out/meta.json "high risk merchant account" "telehealth" ...
./run.sh verify   ../out/verified.json urls.txt ../out/shots   # status, numbers, screenshot, backup
./run.sh check    ../out/check.json    urls.txt                 # status and numbers only, fast
python3 -I feed.py ../out ../feed                                # today's feed, newest first, no repeats
./run.sh match ../out/match.json ours.json swipes.json  # which of our posts used which swipe
python3 -I trim.py ../out/shots/*.png                           # crop empty space before upload
node voc_fetch.js ../out/voc.json trustpilot:tagada.io "thread:https://community.shopify.com/t/..."
```

`run.sh` sets `NODE_USE_ENV_PROXY=1` so `fetch()` goes through the session proxy, and writes a `.log` next to each output.

## The daily run (every morning, 8:45am IST)

The scheduled task "Scooby daily swipe drop" holds the full instructions. In short:

1. Scan the Watchlist (`notion/db/watchlist.csv` plus the global accounts in `notion/db/watchlist-extra.csv`, about 200 accounts) on X, LinkedIn and Instagram, plus Tagada's own accounts, and the Meta Ad Library for Tagada's lanes. Each run adds new breakout accounts to `watchlist-extra.csv`, so the scan keeps widening.
2. `python3 -I feed.py <scan dir> ../feed` keeps posts from the last 48 hours that beat their own account's usual post, ranks the newest first, skips every link sent before (`feed/sent.txt`), re-checks each link and rewrites `latest-links.md`. The feed is pushed to this repo so any session can answer from it in one go.
3. Every feed post goes into the Swipe File in Notion with a screenshot.
3a. Trends: what is blowing up across X, TikTok, Instagram, LinkedIn, YouTube, Reddit and Threads, in two groups (culture, including memes and oddly specific trends; and business: brands, founders, ecommerce, fintech). Each has real numbers, checked example links and a Tagada angle, saved to `feed/trends.md`.
4. There is no daily cap on swipes: every feed post or trend that fits Tagada, TagadaPay or TagadaRx gets at least one swipe, on X, LinkedIn or Instagram, in the Swipes database. The only limit is how many checked bangers the scan finds.
5. Tagada's own posts go into Our Posts with their numbers. `run.sh match out.json ours.json swipes.json` matches each post to the swipe it used (60% or more of the swipe's words, same platform), so posted swipes are found and tracked without anyone typing anything.
6. The dashboard reads Swipes and Our Posts live from Notion.
7. The run is added to the top of the Notion page **Scooby Runs** (newest first): anything not done, trends, bangers and every swipe's full copy. No Slack, no email. On Sundays the run starts with a week in review.

## Data in this repo

`data/2026-10-18/` is the first run: X and LinkedIn scans, Meta ad scan, Trustpilot and Shopify Community pulls, link checks of the existing 247 Swipe File rows and the 70 links cited in the tone audit, and the text of tagada.io, tagadapay.io and tagada.io/rx as they read that day. `screenshots/2026-10-18/` holds the test and re-check screenshots, and `screenshots/2026-10-18/week/` the screenshots of that week's 19 outliers.
