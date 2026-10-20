# Tagada social research (Scooby)

Everything for Tagada, TagadaPay and TagadaRx social research lives in `tagada/`. Read `tagada/README.md` for how the engine works, and `HANDOFF.md` for the current state: Notion IDs, scheduled tasks, swipe IDs, blockers and what's still open.

- `tagada/latest-links.md`: today's feed of bangers on X, LinkedIn and Instagram. Every link was checked when the feed was built. Scooby rebuilds it every morning.
- `tagada/feed/latest.json`: the same feed as data.
- `tagada/feed/sent.txt`: every link already sent in an earlier feed. These never go out again.
- `tagada/feed/trends.md`: today's trends blowing up across social (culture and business), with numbers, checked example links and a Tagada angle.
- Every daily run is logged in Notion on the **Scooby Runs** page (3ffe983412b88151a138da00af91ed58), newest at the top. There is no Slack delivery.
- `tagada/engine/`: the engine that scans, checks links and builds the feed.
- `tagada/notion/db/watchlist.csv` and `tagada/notion/db/watchlist-extra.csv`: the accounts that get scanned.

## When someone asks for links to posts

This covers "banging tweets", "top LinkedIn posts", "Instagram posts to copy", "what's working today" and similar.

**Answer in one message, straight away, from `tagada/latest-links.md`.**
- Give the post link and the profile link for every post, with the score, the age and the key numbers.
- Never answer with only account names.
- Never say you can't get live links, and never say X, LinkedIn or Instagram need a login. The feed already holds checked links, and the engine reads all three platforms without logging in.
- If they asked about one platform, give that platform's section. Otherwise give the top 5 per platform.
- If the feed was built more than 24 hours ago, still answer from it, say when it was built, and offer a fresh scan.

**What counts as a banger**
- Global brands, founders and operators: D2C, B2B, fintech, payments, ecommerce and personal brands, from any country.
- No celebrity or entertainment roundups, no meme pages, and no "viral this week" lists from aggregator sites.
- Posted in the last 48 hours. Newer is better.
- An outlier: engagement ÷ the account's own median post is 3 or more (2.5 or more on LinkedIn). Engagement = likes + 2 × replies + 3 × reposts. Big numbers alone don't count.

**No repeats**
- Never send a link that is in `tagada/feed/sent.txt` from an earlier day.
- Never send a link already given earlier in the same conversation.

**If they want more than the feed has, or a fresh scan**
1. Post a short "scanning now, about 20 minutes" reply first.
2. Then run:
   ```bash
   cd tagada/engine
   ./run.sh xscan /tmp/scan/x.json <X handles from watchlist.csv and watchlist-extra.csv>
   ./run.sh liscan /tmp/scan/li.json <LinkedIn slugs>
   ./run.sh igscan /tmp/scan/ig.json <Instagram handles>
   python3 -I feed.py /tmp/scan ../feed
   ```
3. Answer from the new `tagada/latest-links.md`.

Instagram is read from each profile's public embed page, which shows the 6 newest posts with likes and comments, so `igscan` works without a login.

**If they name a brand:** add one or two swipes built on the posts you sent, for X, LinkedIn and Instagram. Swipe voice rules:
- real numbers only
- no em dashes, exclamation points or "here's"
- never name Stripe, PayPal or Shopify
- no health claims for TagadaRx
- anything unconfirmed goes in [brackets]

**If a scan fails:** say which platform failed and why, then give everything that did verify. If every request fails with 403 or a proxy error, this session's network is restricted, and it needs the cloud environment with full network access.

The engine needs Node with Playwright and Chromium. In Claude Code cloud sessions Chromium is at `/opt/pw-browsers`; never run `playwright install`. `run.sh` sets the proxy and module paths.
