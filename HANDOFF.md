# Scooby handoff (read this first in a new session)

Last updated Oct 20, 2026. This file holds everything a fresh Claude session needs to carry on with Scooby without the old chat.

## What Scooby is

Scooby is Damini's social research assistant for Tagada, TagadaPay and TagadaRx. (It was called Scout until Oct 18.) Every morning it does six things:

1. Reads posts from about 200 global brands, founders and operators on X, LinkedIn and Instagram, plus the Meta Ad Library.
2. Keeps the outliers from the last 48 hours, newest first, and never repeats a link.
3. Opens every link, then saves a screenshot, the profile link and a no-login view.
4. Finds the trends blowing up across X, TikTok, Instagram, LinkedIn, YouTube, Reddit and Threads: culture (memes, sounds, formats, oddly specific trends, pop culture) and business (brands, founders, ecommerce, fintech).
5. Writes swipes with no daily cap: one or more for every banger or trend that fits a brand, across X, LinkedIn and Instagram.
6. Tracks Tagada's own posts and matches them to swipes automatically, so the dashboard compares how they did.

Every run lands on one Notion page, **Scooby Runs**, newest at the top. No Slack and no email (Oct 20).

Since Oct 20 everything lives in **github.com/daminisolanki1309-netizen/tagadasocials**. The old `daminisolanki1309-netizen/project` repo is no longer used; never push there.

How the engine works: `tagada/README.md`. How to answer "give me links" requests: `CLAUDE.md`.

## What Damini asked for (still in force)

- Daily, not weekly. Posts from the last 48 hours only, newer is better, no repetition ever (`tagada/feed/sent.txt`).
- Global, not US or India only. No celebrity, entertainment or meme roundups and no aggregator "viral" lists. `SKIP` in `feed.py` holds mrbeast and netflix.
- No Slack (Oct 20). Every run lands on Notion › Scooby Runs, newest run at the top, oldest at the bottom. When asked for links in a session, give every link in one message, straight away. Never say "I can't get live links" or "X/LinkedIn/Instagram need a login".
- Trends in every run (Oct 20): anything blowing up on any platform, including oddly specific trends, memes and pop culture, plus trends among brands, founders, ecommerce and fintech. Each with real numbers, checked example links and a Tagada angle. The no-celebrity/no-meme rule applies to the bangers feed only.
- Swipes for X, LinkedIn and Instagram, for all three brands. There is no daily cap ("why only 9 a day?").
- Dashboard:
  - simple
  - pistachio palette (pista green, plum/skin, shell)
  - auto-tracks swipes with no one typing numbers
- Flag every refusal, pause or skipped step loudly. Never hide a failure, never make up posts or numbers.
- Copy follows the `tagada-voice` skill:
  - real numbers only
  - no em dashes, exclamation points or "here's"
  - never name Stripe, PayPal or Shopify
  - no health claims for Rx
  - unconfirmed facts go in [brackets]
- Monthly content calendar: paste a calendar into the Calendar Inbox and get references, design direction and copy for each post.

## Where everything lives

| Thing | Where |
| --- | --- |
| Repo (private) | github.com/daminisolanki1309-netizen/tagadasocials, branch `main` |
| Engine | `tagada/engine/` (`run.sh` xscan, liscan, igscan, metascan, check, verify, match; `feed.py`; `trim.py`) |
| Today's feed | `tagada/latest-links.md`, `tagada/feed/latest.json`, `tagada/feed/sent.txt`, `tagada/feed/trends.md` |
| Routine prompt (copy) | `tagada/prompts/daily-swipe-drop.md` |
| Accounts scanned | `tagada/notion/db/watchlist.csv` + `watchlist-extra.csv` |
| Run data and screenshots | `tagada/data/<date>/`, `tagada/screenshots/<date>/` (Oct 18, 19 and 20 so far) |
| Notion exports | `tagada/notion/` |
| Demo video, old Slack announcement, dashboard source | `demo-build/` (`scooby-demo.mp4`, `slack-thread.md`, `dash/index.html`) |
| Allow rules so runs aren't refused | `.claude/settings.json` (Damini added it via GitHub on Oct 19) |

### Notion (hub: Tagada Social Research, 3ede983412b8817abe0fc7e5fd08b215)

| Database or page | ID |
| --- | --- |
| **Scooby Runs (every run, newest at the top)** | 3ffe983412b88151a138da00af91ed58 |
| Swipe File (reference posts) | collection://d9e212c4-fc6c-42a7-8090-955af408a960 |
| Swipes (every swipe written) | collection://d31be6a9-f6fd-45dd-8d6f-bd6d690932e4, view view://f1a2349d-bfd0-4b07-968c-6be8d09b2549 |
| Our Posts (Tagada's posts and metrics) | collection://5ba1255b-35d3-488d-8240-7d55c60e7268, view view://72c019f6-e1f2-4b74-b7e2-5114010f7e44 |
| Watchlist | collection://036adb79-8148-46ff-99c1-0ef33cf47580 |
| Voice of Customer | collection://d928cea5-820d-4f78-9158-53ed105901d7 |
| Content Calendar | collection://c4fa3113-b805-4dab-b120-6ce029880894 |
| Weekly Swipe Drops (old, up to Oct 19) | 3fde983412b881e8b3aec4fe2e35d62e |
| Week of Oct 19 to 25 | 3fee983412b881caad8cca3aaab2c40b |
| Week of Oct 12 to 18 | 3fde983412b881d79c61fd8b95a61a92 |
| Calendar Inbox | 3fde983412b88188919cf3434b13bf7c |

Notion quirks:

- The SQL query allowance on this plan runs out fast. Use `query-data-sources` in view mode with the view URLs above.
- Screenshot upload:
  1. `notion-create-file-upload`
  2. `curl -X POST <upload_url> -H "authorization: <header>" -F file=@shot.png`
  3. Put `![caption](file-upload://<id>)` in the page body.
- The Swipe File URL property is `Link`, not `userDefined:Link`.
- Accounts with no select option (e.g. Greg Isenberg) use Account "Other creator" plus Author.
- Adding a run to Scooby Runs: `notion-update-page` `update_content` with old_str `**⬇️ Newest run first**` and new_str `**⬇️ Newest run first**\n---\n<run>`. That puts the new run on top without touching older ones.

### Swipe IDs so far

The format is `<T|P|R>-<X|LI|IG|AD><n>`.

- **Oct 12–18:** T-X1, T-X2, T-LI1, T-IG1, T-AD1, P-X1, P-X2, P-LI1, P-IG1, P-AD1, R-LI1, R-X1, R-IG1
- **Oct 19:** T-X3, P-X3, T-LI2, T-IG2, T-IG3, T-IG4, P-LI2, P-IG2, P-X4, R-LI2
- **Oct 20:** T-X4, T-X5, T-X6, T-X7, T-LI3, T-LI4, T-LI5, T-IG5, T-IG6, T-IG7, P-X5, P-X6, P-X7, P-LI3, P-IG3, P-IG4, R-X2, R-LI3
- **Oct 20 (second, scheduled run):** T-X8, T-LI6, T-IG8, T-IG9, P-X8, P-LI4, P-IG5, R-X3

Next free IDs: T-X9, T-LI7, T-IG10, P-X9, P-LI5, P-IG6, R-X4, R-LI4, R-IG2.

### Other places

- **Dashboard:** https://claude.ai/artifact/SpXfKLFWkXLz6gaBtZ7ucY ("Scooby performance", Dashboard artifact type).
  - Reads Swipes and Our Posts live from Notion.
  - Palette: --pista #93c572, --pista-deep #5e8c3a, --plum #7b3f61, --shell #efe5cf.
- **Slack:** removed on Oct 20 at Damini's request. Nothing posts to #tagada-swipes (C0CAZRXR0QG) any more; the hourly Slack routine is paused, not deleted.

### Scheduled tasks (claude.ai/code → left sidebar → Routines, NOT Customize)

| Task | ID | When |
| --- | --- | --- |
| Scooby daily swipe drop | trig_01AKdtiMcwMN6LDLvqrN3kbC | 8:45am IST daily (no cap on swipes; trends; logs to Scooby Runs; 12-step prompt, copy in `tagada/prompts/daily-swipe-drop.md`) |
| Scooby: answer Slack questions | trig_019ZzaPgvNt576Wxo68mUZHH | **paused Oct 20** (Slack removed) |
| Scooby calendar | trig_01TUhhGJcKTMtZ4gcP4PhZ8b | on demand |

## ⚠️ Blockers (the daily run has failed on Oct 19 and Oct 20)

Both mornings the scheduled run stopped within 20 seconds and sent Damini a push notification:

1. **No connectors in the routine.** Notion is connected on the account, but a scheduled task only gets the connectors attached to it. Fix: Routines → "Scooby daily swipe drop" → edit → add Notion (Slack and Gmail are no longer needed). Do the same for "Scooby calendar". The `create_trigger` tool in sessions cannot attach connectors, so Damini has to do this in the UI.
2. **No repo in the routine.** On Oct 20 the clone failed: GitHub asked for a username and `GH_TOKEN` was invalid. Fix: in the same edit screen, add the repository `daminisolanki1309-netizen/tagadasocials` as a source. That also makes `.claude/settings.json` apply, so the engine commands aren't refused (Oct 19 was refused by the auto-mode check).

Until both are done, run the daily drop by hand in a session: "run today's Scooby drop". (Oct 20 was run by hand.)

## Manual daily drop (what the routine does, step by step)

1. Scan in parallel in the background from the repo root: `tagada/engine/run.sh xscan scan/x.json ...`, `liscan scan/li.json ...`, `igscan scan/ig.json ...`, with handles from both watchlist CSVs. X paces itself at about 25s per account (~40 min).
2. While it runs: trends research (web search, extended mode), checking 1 to 3 example links per trend. Write `tagada/feed/trends.md`.
3. `python3 -I tagada/engine/feed.py scan tagada/feed`
4. Commit `latest-links.md`, `feed/` and the watchlist. Push to main.
5. `run.sh verify` for screenshots, then `trim.py`. Upload to Notion and create one Swipe File row per feed post.
6. Write swipes into Swipes: at least one per fitting post or trend, and every brand and platform covered.
7. Refresh Our Posts metrics, then `run.sh match` to auto-link posted swipes.
8. Add the run to the top of Scooby Runs (trends, bangers, every swipe's full copy in toggles, anything not done in a red callout).
9. On Sundays, put a week in review at the top of that day's run on Scooby Runs. No email.

The full wording is in the trigger prompt (`get_trigger trig_01AKdtiMcwMN6LDLvqrN3kbC`) and `tagada/prompts/daily-swipe-drop.md`.

## Still open

- [ ] Oct 20, 07:00 UTC: the scheduled routine ran end to end for the first time, with Notion and the repo available (8 swipes, logged on Scooby Runs). Check tomorrow's 8:45am IST run also gets them before closing the Blockers section.
- [x] `trim.py` failed on Oct 20 because `python3` (3.11) picked up the system Pillow built for 3.12. Fixed: `tagada/engine/setup.sh` runs at session start and installs a matching Pillow. The Oct 20 run2 screenshots are trimmed in the repo; the copies in Notion are still the untrimmed uploads.
- [ ] Meta Ad Library: "subscription billing" and "Easy Pay Direct" returned 0 ads twice on Oct 20 (07:00 run). The other lanes now load.
- [ ] Instagram 429s on deel, gusto, lennysan and the new handles emmafy, orthora, relivex.official (handles unconfirmed).

- [ ] Damini: attach Notion and the tagadasocials repo to "Scooby daily swipe drop" and "Scooby calendar" (see Blockers).
- [x] Oct 20 drop: run by hand in a session (first run with trends and the Scooby Runs page): 26 bangers, 14 trends, 18 swipes.
- [ ] Meta Ad Library lane searches ("payment processor", "chargebacks", "telehealth" and others) returned 0 ads twice on Oct 20; only "high risk merchant account" loaded. Look at `metascan` if it repeats.
- [ ] Confirm whether @JoinTagadaPay's "Where the payout email finds me." (Oct 19) came from swipe T-IG1 (same Coinbase reference, no word match).
