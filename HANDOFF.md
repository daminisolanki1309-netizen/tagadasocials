# Scooby handoff (read this first in a new session)

## Daily scheduled run

The daily Scooby run (scheduled task "Scooby Dooby runs daily", 08:00 IST) follows `tagada/prompts/daily-swipe-drop.md`. Read it at the start of every run. Where it differs from the prompt stored in the scheduled task, the file wins: it adds the creative watchlist (`watchlist-creative.csv`), `handles.py`, the TikTok scan (`ttscan`), the Post Links Inbox with `postscan`, the Creative tier, `handle-failures.tsv` and the swipe-log checks.

Last updated Nov 3, 2026. This file holds everything a fresh Claude session needs to carry on with Scooby without the old chat.

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
| Every swipe ever written, incl. Skipped (no-repeat memory) | `tagada/feed/swipe-log.tsv` |
| Routine prompt (copy) | `tagada/prompts/daily-swipe-drop.md` |
| Accounts scanned | `tagada/notion/db/watchlist.csv` + `watchlist-extra.csv` + `watchlist-creative.csv` (creative brands, creators, thought leaders; X, Instagram, LinkedIn, TikTok). `python3 -I tagada/engine/handles.py tagada/notion/db scan/lists` builds the deduplicated lists |
| Post Links Inbox (LinkedIn creator posts, TikToks pasted by the team) | Notion 400e983412b8819aafb3e3018e8fea10 |
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

- **Oct 21 (scheduled run):** T-IG10, T-X9, T-LI7, P-LI5, T-X10, T-IG11, T-LI8, P-X9, R-LI4

- **Oct 21 (creative update):** T-X11, T-IG12, T-IG13, P-LI6

- **Oct 22 (scheduled run):** T-IG14, P-LI7, T-LI9, T-IG15, T-X12, T-X13, T-LI10, R-LI5, P-IG6

- **Oct 23 (scheduled run):** T-X14, T-X15, T-LI11, P-LI8, T-IG16, T-X16, R-X4, R-LI6, T-LI12, T-IG17

- **Oct 24 (scheduled run):** T-X17, T-LI13, T-IG18, T-IG19, T-X18, P-IG7, R-LI7

- **Oct 25 (scheduled run):** T-LI14, T-X19, P-X10, T-IG20, T-LI15, T-X20, P-LI9, R-IG2

- **Oct 27 (scheduled run):** P-LI10, T-X21, T-IG21, R-X5 (no run on Oct 26)

- **Oct 28 (scheduled run):** P-IG8, T-LI16, P-X11, P-LI11, T-X22, R-LI8, T-IG22, T-X23

- **Oct 29 (scheduled run):** T-X24, T-LI17, R-X6, T-IG23, P-IG9, P-LI12

- **Oct 30 (scheduled run):** T-IG24, P-IG10, T-X25, P-X12, P-LI13, T-LI18, R-LI9

- **Oct 31 (scheduled run):** P-X13, P-LI14, T-LI19, T-X26, T-IG25, P-IG11, R-IG3, T-IG26

- **Nov 1 (scheduled run):** T-X27, T-LI20, T-IG27, T-X28, T-LI21, P-X14, P-LI15, P-IG12, R-IG4 (all Skipped by Damini the same day)

- **Nov 1 (late, avatar swipes after the taste review):** T-X29, T-LI22, T-IG28, T-IG29, P-X15, P-LI16, P-IG13, R-LI10, R-IG5

- **Nov 2 (rerun on request):** T-IG30, T-X30, P-LI17, R-IG6

- **Nov 3 (scheduled run):** R-IG7, T-LI23, P-IG14, P-X16

Next free IDs: T-X31, T-LI24, T-IG31, P-X17, P-LI18, P-IG15, R-X7, R-LI11, R-IG8.

Handles that failed a scan are logged in `tagada/feed/handle-failures.tsv`. A handle that fails two runs in a row gets fixed or removed. 30 X creative accounts weren't scanned on Oct 21 (X rate limit) and run in the next daily scan.

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

- [ ] Nov 3: Meta Ad Library "chargebacks" and "checkout upsell" returned 0 ads twice. "payment processor", "telehealth", "Easy Pay Direct" and "TailoredPay" loaded on the retry. The Nov 2 block didn't repeat. The Collagen Co. (peptides) and Ink+Volt (subscription billing) crossed 60 days on Nov 2 and were added as format only at 61 days. Scott Disick's telehealth ad (62 days) is still behind the age login.
- [ ] Nov 3: Notion's Swipes view shows T-X21, T-X28 and R-IG4 as Ready, but the log had them as Skipped. T-X22, T-LI10, R-X6 and T-IG28 are Ready too. The log was synced to Notion. Either Damini un-skipped them, or the Nov 1 sync was wrong; check with her.
- [ ] Nov 3: Tagada launches something at 9:00 ET today (teasers on X and LinkedIn, Nov 2). The 4 new Our Posts rows are Brand Tagada until the launch shows which brand it is. T-LI23 (take 1 of the launch video) depends on that footage existing.
- [ ] Nov 3: only 4 swipes (Tagada 1, TagadaPay 2, TagadaRx 1). 32 of the 36 Swipe File rows are format only, and 8 of the 10 trends are Skip. The Cotopaxi drop-calendar trend repeats T-LI22 and T-X25. P-IG14 quotes Jesse Atkins' public Trustpilot review, so ask him first. P-X16 needs the cascade wording confirmed. R-IG7 needs Rx review and the same person from the Oct 25 video.
- [ ] Nov 3: TikTok wendys was removed (no own videos, Nov 2 and 3); fentybeauty failed for the first time. ScrubDaddy (X) and eightx (LinkedIn) failed again. Creative list +5 Instagram: maccosmetics, prada, midihealth, cotopaxi, nobodyschild. Instagram noom read fine but its median is 9 likes, so it wasn't added.
- [ ] Nov 2: Damini marked 53 more swipes Skipped on Nov 1 (all 9 Nov 1 morning swipes and nearly everything from Oct 18 to 31). Only R-X1, R-X2, P-X9 and T-LI10 survive. `tagada/prompts/taste-guide.md` records what she rejects and the new bar (two-line true product mechanics or real executions, one avatar each: Dylan / Marcus / Brooke from her avatars doc); the daily prompt now reads it before writing swipes. Watch her reaction to the 9 avatar swipes (Nov 1 late) and the 4 Nov 2 swipes.
- [ ] Nov 2: Meta Ad Library returned 0 ads on all 13 queries, and 12 again on the retry (only "chargebacks" loaded). Looks like Facebook blocking the session; no Meta rows on Nov 2. Check whether it repeats.
- [ ] Nov 2: avatar accounts added after a scan showed them: IG drmaryclaire, hims, daradenney, taylorholiday; LI hims-&-hers, ro, common-thread-collective; TikTok drmaryclaire; X TaylorHoliday. X handles ShackDTC, nickshackelford, daradenney, codyplofker, drmaryclaire, hims, HenryMeds returned 0 posts on the syndication timeline (logged, not added); ask Damini for exact X handles. Henry Meds' LinkedIn hasn't posted in 11 months.
- [ ] Nov 2: the first attempt at the Nov 2 rerun died when the session paused overnight (xscan stopped at 84 of 140); a fresh scan into scan3 produced the entry. A separate Nov 2 02:38 UTC session only synced the swipe log and wrote no Scooby Runs entry.
- [ ] Nov 1: TikTok scrubdaddy, liquiddeath, chipotle, crocs, aldiuk and lidlgb showed no own videos for the second run in a row and were removed from watchlist-creative.csv (TikTok list now 10; duolingo failed today for the first time since Oct 28). ttscan already reads tiktok.com/discover/<handle> as well as /tag/<handle>, so the Oct 31 idea of "switching to discover pages" doesn't help; these brands just don't surface there. Only 1 TikTok video made the feed. Better source needed (for example the Post Links Inbox, or brand handles that appear on discover pages).
- [ ] Nov 1: Meta Ad Library "checkout upsell" returned 0 ads first and loaded on the retry (28). Scott Disick's telehealth ad crossed 60 days but is behind Facebook's age login (not saved). Checkout Champ's ad that was at 59 days on Oct 31 no longer appears between 59 and 61 days. Cheeseaholic's Whop ad (61 days, crossed 60 on Oct 31) was added to the Swipe File as format only. Nourish's telehealth ad (Swipe File) is now Broken.
- [ ] Nov 1: ScrubDaddy (X) and eightx (LinkedIn) failed again (main watchlist.csv, waiting on Damini). Creative list +3 Instagram: manscaped, loewe, partiful. Candidates drinkwaterboy, bettercreativeco, graza.co and poppi not found; lushcosmetics hides likes. No breakout brands for watchlist-extra.csv.
- [ ] Nov 1: 9 swipes (Tagada 5, TagadaPay 3, TagadaRx 1). Trends: 5 culture (3 Skip) and 4 business; the FTC price-at-the-register and Meta per-asset trends were not swiped (too close to T-IG25/R-IG3 and T-LI17). T-IG27 needs a confirmed gift note box on the checkout; P-X14 needs a real count from the TagadaPay team; P-LI15 and P-IG12 describe internal practices that must be real; R-IG4 needs Rx review and a real sheet behind the comment keyword. Once Upon a Farm's 29.5x refund notice: reason unknown. New Our Posts row: @tagadapay's Dubai Table reel (Oct 31).
- [ ] Nov 1: when inserting into Scooby Runs, the marker on the page is `<b>⬇️ Newest run first</b>` (the `**...**` form no longer matches). Use `<toggle>` and `<mention url=... />`; `<details>` and `<mention-page>` are auto-converted with warnings.
- [ ] Oct 31: TikTok tag pages (tiktok.com/tag/<tag>) returned 0 videos for every tag, in ttscan and in the trends research. 7 of 16 TikTok accounts (scrubdaddy, liquiddeath, chipotle, crocs, wendys, aldiuk, lidlgb) showed no own videos and 0 TikTok bangers made the feed. Discover pages (tiktok.com/discover/<topic>) still list videos. If it repeats, switch ttscan to discover pages before removing any handle.
- [ ] Oct 31: Meta Ad Library "payment processor" returned 0 ads first and loaded on the retry (29 ads); the other 12 queries loaded. ClearSale's chargeback ad (65 days, crossed 60 on Oct 26) and The Vitamin Shoppe's peptides ad (60 days) were added to the Swipe File. Checkout Champ's own ad is at 59 days and crosses 60 tomorrow.
- [ ] Oct 31: ScrubDaddy (X) and eightx (LinkedIn) failed again (main watchlist.csv, waiting on Damini). Creative list +4 Instagram: grillospickles, ikea, kfc, headspace. Instagram candidates scuffers, hellmanns and partake are not found. No breakout brands for watchlist-extra.csv.
- [ ] Oct 31: 8 swipes (Tagada 4, TagadaPay 3, TagadaRx 1). Only 4 culture and 4 business trends cleared the evidence bar. T-IG26 (Cooper in costume) only works on Oct 31. P-X13 leans on the Red Baron prank story without naming it; check the team is comfortable. P-LI14 describes the FTC complaint against a payments company (unnamed); have someone check the wording. R-IG3 needs Rx review. Tagada's three accounts posted nothing new on Oct 30 or 31.
- [x] Oct 30: feed.py let a LinkedIn post about 59 hours old into the feed. Fixed Oct 31: feed.py dates LinkedIn posts from the activity ID (id >> 22 is the ms timestamp) before the 48-hour filter.
- [ ] Oct 30: Meta Ad Library "chargebacks", "telehealth", "Easy Pay Direct" and "Sticky.io" returned 0 ads twice ("payment processor", "Checkout Champ", "Whop" and "USA Payments" loaded on the retry; "high risk merchant account" loaded again, 29 ads). The Vitamin Shoppe's peptides ad is at 59 days and crosses 60 tomorrow; ClearSale did not show up (the chargebacks query was empty).
- [ ] Oct 30: ScrubDaddy (X) and eightx (LinkedIn) failed again (main watchlist.csv, waiting on Damini). TikTok revolut failed a second time (Oct 25 and Oct 30) and was removed from watchlist-creative.csv. Creative list +4 Instagram: doritos, wingstop, jetblue, sweetgreen. No new breakout brands for watchlist-extra.csv (the web search found nothing current).
- [ ] Oct 30: 7 swipes (Tagada 3, TagadaPay 3, TagadaRx 1). Only 5 culture and 3 business trends cleared the evidence bar; "paws at you", JADE's S.A.D. version and Must Eat were not swiped (too close to Skipped T-IG11/T-X16, T-IG16/T-IG18 and T-X15). R-LI9 (founder takeover) needs a real TagadaRx founder who agrees. New Our Posts rows: the LinkedIn AI-agents post (Tagada), the X "6 months chasing doctors" video (TagadaRx) and the X "Elon knows the future of ecommerce is DTC" post, which spells the platform "Shooify" once.
- [ ] Oct 29: Meta Ad Library "high risk merchant account", "checkout upsell" and "subscription billing" returned 0 ads twice ("peptides" and "Sticky.io" loaded on the retry). "high risk merchant account" has now failed two runs in a row; look at metascan for it. ClearSale's chargeback ad is at 63 days and still not added; The Vitamin Shoppe (peptides) and Cheeseaholic (Whop) cross 60 days this weekend.
- [ ] Oct 29: ScrubDaddy (X) and eightx (LinkedIn) failed again (main watchlist.csv, waiting on Damini). TikTok chipotle showed no own videos (first failure); 0 TikTok bangers today. Creative list +4 Instagram: slimjim, chipsahoy, hotpockets, spotify; snackish added to watchlist-extra.csv.
- [ ] Oct 29: 6 swipes (Tagada 3, TagadaPay 2, TagadaRx 1). Only 4 trends per group cleared the evidence bar; Reddit not checked (JSON endpoint returned no data). New Our Posts rows for "our AM lives on Google Meet" (X and LinkedIn, Oct 28) are Brand TagadaRx; switch if "the launch" means something else.
- [ ] Oct 28: Meta Ad Library "high risk merchant account" and "TailoredPay" returned 0 ads twice ("Checkout Champ" loaded on the retry). "Easy Pay Direct" and "Sticky.io" load again (22 and 26 ads). ClearSale's chargeback ad is at 62 days (crossed 60 on Oct 26, no run that day); not added.
- [ ] Oct 28: ScrubDaddy (X) and eightx (LinkedIn) failed again (main watchlist.csv, waiting on Damini). TikTok duolingo and gymshark showed no own videos (duolingo also failed Oct 25 but was found Oct 27; gymshark first failure). Creative list +3 Instagram: owala, eosproducts, kitkat.
- [ ] Oct 28: 8 swipes (Tagada 4, TagadaPay 3, TagadaRx 1). Only 4 business trends cleared the evidence bar. Leaned on real team footage (parents reel, skull cap dispute skit, carved pumpkins), a first-person list and single-line X posts; no news explainer except P-LI11 (Visa numbers). Check Damini's reaction to R-LI8 (needs Rx review and has to go out by Oct 31).
- [ ] Oct 27: 26 open swipes from Oct 22 to 25 (T-X13, P-IG6, every Oct 23 and Oct 25 swipe, and all Oct 24 swipes except R-LI7) were deleted from Notion, not archived. They are logged as Skipped. Kept in Notion: the Oct 18 to 22 real-footage, list, explainer and first-person swipes plus R-LI7. Oct 27 wrote only 4 swipes (P-LI10, T-X21, T-IG21, R-X5) and held back news explainers, memes and snowclones. Check Damini's reaction before writing more of either kind.
- [ ] Oct 27: Meta Ad Library "Easy Pay Direct" and "Sticky.io" returned 0 ads twice. "high risk merchant account" and "USA Payments" loaded on the retry.
- [ ] Oct 27: Instagram marketingexamples removed from watchlist-creative.csv (429 on Oct 23, 25 and 27). ScrubDaddy (X) and eightx (LinkedIn) still fail (main watchlist.csv, waiting on Damini). Added Instagram ourplace, chubbies, yeti and athleticbrewing to the creative list.
- [ ] Oct 27: no daily run on Oct 26 (no section on Scooby Runs, no commits).
- [ ] Oct 27: when a scan file is merged by hand (for example candidate handles into scan/ig.json), dedupe by account first; feed.py listed athleticbrewing twice until the merge was deduplicated.
- [ ] Oct 25: X's syndication timeline is fresh for only about 42 of the 132 X accounts (same as Oct 24); for the rest it returns posts from months ago (median newest post: April 2026), so those accounts can never produce a 48-hour banger. On a weekend that left 0 new X bangers (the outliers were already sent Oct 24, or were Polymarket and Kalshi). Worth a look at xscan's source for those accounts.
- [ ] Oct 25: Meta Ad Library "Checkout Champ" and "TailoredPay" returned 0 ads first and loaded on the retry. "payment processor" and "peptides" load again (27 and 28 ads).
- [ ] Oct 25: ScrubDaddy (X) and eightx (LinkedIn) failed again (main watchlist.csv, waiting on Damini). TikTok duolingo and revolut showed no own videos; Instagram marketingexamples got 429 (0 posts). If they fail again on Oct 26, remove them from the creative list.
- [ ] Oct 25: main had been left behind at the Oct 23 commit; the Oct 24 commits only reached the session branch. This run pushed both to main (fast-forward).
- [ ] Oct 24: Meta Ad Library "payment processor" and "peptides" returned 0 ads twice ("high risk merchant account", "checkout upsell" and "Checkout Champ" loaded on the retry). "subscription billing" loads again (23 ads).
- [ ] Oct 24: ScrubDaddy (X) and eightx (LinkedIn) still fail every run; both are in the main watchlist.csv and wait on Damini. Instagram deel and lennysan and TikTok tacobell were removed after repeated failures.
- [ ] Oct 24: TagadaPay and TagadaRx got 1 swipe each (P-IG7, R-LI7). Payments material in the feed and trends (stablecoins, Fireblocks, payout jokes) was too close to P-LI8 or Skipped angles.
- [ ] Oct 24: wait loops that use `pgrep -f "swipe_engine.js ..."` match their own command line and never end; check scan logs for the "wrote" line instead. run.sh needs absolute output paths (it cd's into tagada/engine).
- [ ] Oct 23: TagadaRx launched Oct 22. The jointagada LinkedIn launch post did 486 reactions and 72 comments (about 65x the page's usual). R-X4 and R-LI6 follow up on it and need Rx review. Our Posts rows for the launch are Brand TagadaRx.
- [ ] Oct 23: Meta Ad Library "subscription billing" returned 0 ads twice (it also failed on Oct 20). "chargebacks", "telehealth", "peptides", "Easy Pay Direct" and "TailoredPay" load again.
- [ ] Oct 23: the X scanner's browser crashed mid-run ("Target page, context or browser has been closed") and every later account was marked "load failed". Resuming fixed it, but xscan should relaunch the browser when that happens instead of churning through the list.
- [ ] Oct 23: ScrubDaddy (X) and eightx (LinkedIn) in the main watchlist.csv fail every run; the X Grammarly, Brex, gusto, glossier, drinkAG1, drsquatch and 8 LinkedIn slugs were removed from watchlist-extra.csv. Damini: correct handles if any of them should stay.
- [ ] Oct 23: TagadaPay got 1 swipe today (P-LI8). Most payments angles in the feed and trends were too close to Skipped ones (payout speed, bots and fraud).
- [ ] Oct 22: the 7 Oct 21 morning swipes (T-IG10, T-X9, T-LI7, P-LI5, T-X10, T-IG11, T-LI8) were gone from Notion; logged as Skipped. Damini kept the creator-style and real-footage ones (T-X11, P-LI6, T-IG12, T-IG13). Oct 22 leaned on real footage, culture lists and plain explainers and held back meme-caption trends; check her reaction before going back to memes.
- [ ] Oct 22: Meta Ad Library "chargebacks", "telehealth", "peptides", "Easy Pay Direct" and "TailoredPay" returned 0 ads twice (USA Payments and Sticky.io load again). Look at metascan for these queries.
- [ ] Oct 22: LinkedIn slugs eightx, gusto, linear-app, attentive-mobile, lemonade-inc, superhuman-labs, mercury, notion, ramp-business have returned 0 posts every run since Oct 20 (they live in watchlist.csv / watchlist-extra.csv); they need the right company slugs or removal.
- [ ] Oct 22: X Grammarly, Brex, gusto, glossier, drinkAG1, drsquatch return 0 posts on the syndication timeline every run (main watchlists). 17 creative handles that failed two runs in a row were removed or fixed (see handle-failures.tsv).
- [ ] Oct 22: @JoinTagadaPay and jointagada posted launch teasers ("Telehealth is about to get lot easier"); the X rows in Our Posts are Brand TagadaPay with a note to switch to TagadaRx if it is the Rx launch.
- [ ] Oct 21: Damini marked 44 of the 49 swipes up to Oct 20 Skipped (only T-IG8, T-X7, T-LI5, R-X2 and R-X1 are not). Read as: no more payout-hold, backup-processor, account-review, villain or countdown angles. The Oct 21 run followed that; check her reaction to the lighter, format-led swipes before leaning further that way.
- [ ] Oct 21: Meta Ad Library "USA Payments" and "Sticky.io" returned 0 ads twice (the brand ads still exist under other queries). Musely (peptides lane, 61 days) is behind a Facebook age login and can't be saved.
- [ ] Oct 21: graza is not the right Instagram handle for Graza; not added to watchlist-extra.csv.
- [ ] Oct 21: the trends subagent got 403 from x.com in Playwright, so trends carry no X numbers. The engine's X syndication scan is unaffected.
- [ ] Oct 20, 07:00 UTC: the scheduled routine ran end to end for the first time, with Notion and the repo available (8 swipes, logged on Scooby Runs). Check tomorrow's 8:45am IST run also gets them before closing the Blockers section.
- [x] `trim.py` failed on Oct 20 because `python3` (3.11) picked up the system Pillow built for 3.12. Fixed: `tagada/engine/setup.sh` runs at session start and installs a matching Pillow. The Oct 20 run2 screenshots are trimmed in the repo; the copies in Notion are still the untrimmed uploads.
- [ ] Meta Ad Library: "subscription billing" and "Easy Pay Direct" returned 0 ads twice on Oct 20 (07:00 run). The other lanes now load.
- [x] Instagram "429s" on Oct 20 were wrong handles, not a rate limit: Instagram's embed page said the profile doesn't exist, and the engine's fallback endpoint always answers 429 from cloud IPs. `igscan` now reports "Handle not found" instead. Fixed: gusto is @gustohq, emmafy is @emmafy.official.
- [ ] Damini: correct Instagram handles needed for Deel (`deel`), Lenny Rachitsky (`lennysan`), Orthora and ReliveX. They stay in watchlist-extra.csv and show as "Handle not found" until fixed.

- [ ] Damini: attach Notion and the tagadasocials repo to "Scooby daily swipe drop" and "Scooby calendar" (see Blockers).
- [x] Oct 20 drop: run by hand in a session (first run with trends and the Scooby Runs page): 26 bangers, 14 trends, 18 swipes.
- [ ] Meta Ad Library lane searches ("payment processor", "chargebacks", "telehealth" and others) returned 0 ads twice on Oct 20; only "high risk merchant account" loaded. Look at `metascan` if it repeats.
- [ ] Confirm whether @JoinTagadaPay's "Where the payout email finds me." (Oct 19) came from swipe T-IG1 (same Coinbase reference, no word match).
