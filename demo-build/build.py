"""Builds the Scooby demo scenes as HTML files, one per scene."""
import pathlib

HERE = pathlib.Path(__file__).parent

# Pistachio palette, same as the dashboard: nut green, deep green, skin plum, shell cream.
CSS = """
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1200px; height: 750px; }
body { font-family: Inter, 'Helvetica Neue', Arial, sans-serif; background: #f7f2e4; color: #1f2a17; padding: 56px 72px; position: relative; overflow: hidden; }
body::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 14px; background: linear-gradient(#93c572, #5e8c3a); }
.kicker { font-size: 17px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #7b3f61; margin-bottom: 16px; }
h1 { font-size: 64px; line-height: 1.05; font-weight: 800; letter-spacing: -.02em; }
h1 em, h2 em { font-style: normal; color: #5e8c3a; }
h2 { font-size: 42px; line-height: 1.1; font-weight: 800; letter-spacing: -.015em; margin-bottom: 30px; }
p.lead { font-size: 26px; line-height: 1.4; color: #4a5240; max-width: 940px; margin-top: 26px; }
.foot { position: absolute; left: 72px; right: 72px; bottom: 32px; display: flex; justify-content: space-between; font-size: 15px; color: #8a8a74; }
.stats { display: flex; gap: 20px; }
.stat { flex: 1; background: #fff; border: 1px solid #e3dcc6; border-top: 6px solid #93c572; border-radius: 16px; padding: 26px; }
.stat b { display: block; font-size: 64px; font-weight: 800; letter-spacing: -.03em; color: #5e8c3a; }
.stat span { font-size: 21px; color: #4a5240; }
.note { margin-top: 26px; font-size: 21px; line-height: 1.45; color: #4a5240; }
table { width: 100%; border-collapse: collapse; font-size: 21px; }
td { padding: 8px 0; border-bottom: 1px solid #e3dcc6; vertical-align: middle; }
td.score { width: 120px; font-weight: 800; font-size: 25px; color: #5e8c3a; }
td.bar { width: 260px; }
.barfill { height: 14px; border-radius: 7px; background: #93c572; }
td.who { color: #8a8a74; width: 250px; padding-right: 20px; }
.pill { display: inline-block; font-size: 14px; font-weight: 700; padding: 4px 10px; border-radius: 999px; margin-left: 8px; background: #f1e3ea; color: #7b3f61; vertical-align: middle; }
.split { display: flex; gap: 44px; align-items: flex-start; }
.shot { border-radius: 14px; border: 1px solid #e3dcc6; background: #fff; box-shadow: 0 8px 30px rgba(40,50,20,.10); }
.checks { list-style: none; font-size: 23px; line-height: 1.45; }
.checks li { padding: 9px 0; border-bottom: 1px solid #e3dcc6; }
.checks li::before { content: '\\2713'; color: #5e8c3a; font-weight: 800; margin-right: 14px; }
.card { background: #fff; border: 1px solid #e3dcc6; border-left: 6px solid #93c572; border-radius: 14px; padding: 24px 28px; font-size: 22px; line-height: 1.45; white-space: pre-line; }
.label { font-size: 14px; font-weight: 700; letter-spacing: .08em; color: #8a8a74; text-transform: uppercase; }
.tag { display: inline-block; font-size: 16px; font-weight: 700; padding: 6px 12px; border-radius: 999px; margin: 14px 8px 0 0; }
.t1 { background: #e4f1d8; color: #3f6b22; } .t2 { background: #f1e3ea; color: #7b3f61; } .t3 { background: #efe5cf; color: #6b5a2e; }
.flow { display: flex; align-items: stretch; gap: 18px; }
.box { flex: 1; background: #fff; border: 1px solid #e3dcc6; border-radius: 16px; padding: 24px; font-size: 21px; line-height: 1.4; }
.box b { display: block; font-size: 14px; letter-spacing: .08em; text-transform: uppercase; color: #7b3f61; margin-bottom: 10px; }
.arrow { font-size: 36px; color: #5e8c3a; align-self: center; }
.ask { background: #fff; border: 1px solid #e3dcc6; border-radius: 14px; padding: 16px 22px; font-size: 22px; margin-bottom: 12px; }
.ask code { font-family: inherit; font-weight: 700; color: #3f6b22; background: #e4f1d8; padding: 2px 8px; border-radius: 6px; }
.ask span { color: #8a8a74; font-size: 18px; display: block; margin-top: 4px; }
.where { font-size: 21px; line-height: 1.4; }
.where div { padding: 10px 0; border-bottom: 1px solid #e3dcc6; }
.where em { font-style: normal; color: #5e8c3a; font-weight: 800; }
.slack { background: #fff; border: 1px solid #e3dcc6; border-radius: 14px; padding: 22px 26px; font-size: 19px; line-height: 1.5; }
.slack b { color: #1f2a17; } .slack .link { color: #1264a3; }
.mini { display: flex; gap: 14px; margin-top: 14px; }
.mini div { flex: 1; background: #fff; border: 1px solid #e3dcc6; border-radius: 12px; padding: 14px 16px; font-size: 18px; }
.mini b { display: block; font-size: 34px; color: #5e8c3a; }
"""

FOOT = '<div class="foot"><span>Scooby, the Tagada social research assistant</span><span>{n} / {total}</span></div>'

scenes = []

scenes.append("""
<div class="kicker">New in the Tagada family</div>
<h1>Berry's got a sibling.<br>Meet <em>Scooby</em>.</h1>
<p class="lead">Every morning Scooby finds the posts beating their own numbers on X, LinkedIn and Instagram, from brands and founders worldwide, and writes our version for Tagada, TagadaPay and TagadaRx.</p>
<p class="note">60 seconds: what it does, how to read it, how to use it.</p>
""")

scenes.append("""
<div class="kicker">Every morning, 8:45am IST</div>
<h2>It reads what <em>175 global accounts</em> posted in the last 48 hours</h2>
<div class="stats">
  <div class="stat"><b>84</b><span>X accounts</span></div>
  <div class="stat"><b>40</b><span>LinkedIn pages</span></div>
  <div class="stat"><b>51</b><span>Instagram accounts</span></div>
  <div class="stat"><b>7</b><span>Meta ad searches</span></div>
</div>
<p class="note">D2C, B2B, fintech, payments and founder accounts from any country. No celebrity roundups, no meme pages, no "viral this week" lists. The list grows every day as Scooby adds accounts that break out.</p>
""")

rows = [
    ("8.8x", "", "Greg Isenberg, 33 hours old", "@gregisenberg, Instagram"),
    ("6.6x", "", "Kalshi, 11 hours old", "@Kalshi, X"),
    ("5.7x", "", "Gary Vee, 16 hours old", "@garyvee, Instagram"),
    ("3.3x", "", "Ramp, 24 hours old", "@tryramp, X"),
    ("2.5x", "Rising", "Hormozi, 11 hours old", "@hormozi, Instagram"),
    ("2x", "Rising", "e.l.f., 14 hours old", "@elfcosmetics, Instagram"),
]
trs = "".join(
    f'<tr><td class="score">{s}</td><td>{t}{f"<span class=pill>{tier}</span>" if tier else ""}</td><td class="who">{w}</td>'
    f'<td class="bar"><div class="barfill" style="width:{float(s[:-1]) / 8.8 * 100:.0f}%"></div></td></tr>'
    for s, tier, t, w in rows
)
scenes.append(f"""
<div class="kicker">How to read the score · today's feed</div>
<h2>Each post is scored against <em>that account's usual post</em></h2>
<table>{trs}</table>
<p class="note"><b>Banger</b> = 3x or more (2.5x on LinkedIn). <b>Rising</b> = under 24 hours old and already 2x. Big accounts don't win on size: only posts that beat their own normal make it. Newest ranks first, and a link is never sent twice.</p>
""")

scenes.append("""
<div class="kicker">Links you can trust</div>
<div class="split">
  <img class="shot" src="kalshi.png" style="width:520px">
  <div style="flex:1">
    <h2 style="font-size:36px">Every post is opened, checked and screenshotted that morning</h2>
    <ul class="checks">
      <li>Link to the exact post</li>
      <li>Link to the profile</li>
      <li>A no-login view that opens without an account</li>
      <li>Screenshot and numbers saved in the Notion Swipe File</li>
    </ul>
    <p class="note">If a post is deleted later, the screenshot stays.</p>
  </div>
</div>
""")

scenes.append("""
<div class="kicker">Then it writes our version · no daily cap</div>
<div class="split">
  <div style="width:400px">
    <img class="shot" src="kalshi.png" style="width:400px">
    <p class="note" style="font-size:18px;margin-top:12px">Built on: Kalshi, 6.6x its usual post</p>
  </div>
  <div style="flex:1">
    <div class="card"><span class="label">Tagada · X post · T-X3 · Ready</span>
New York lost 2,000 restaurants in a year, the biggest drop in 36+ years.

Every one of them had a last good month.

If your payouts froze tomorrow, how many weeks could you keep paying for ads?</div>
    <span class="tag t1">A swipe for every banger that fits</span><span class="tag t2">Tagada, TagadaPay, TagadaRx</span><span class="tag t3">X, LinkedIn, Instagram</span>
    <p class="note" style="font-size:19px">Today: 8 bangers, 10 swipes. Anything in [brackets] needs a real number or a sign-off before it goes out.</p>
  </div>
</div>
""")

scenes.append("""
<div class="kicker">Where it shows up</div>
<h2>The daily drop lands in <em>#tagada-swipes</em></h2>
<div class="slack">
<b>🐶 Scooby: Daily drop, Monday Oct 19</b><br>
8 bangers from the last 48 hours, from 175 global accounts. 10 swipes written.<br>
• 6.6x · 11h · Kalshi · 2,336 likes, 116 replies, 230 reposts<br>
&nbsp;&nbsp;<span class="link">x.com/Kalshi/status/2111893467894858117</span> · profile <span class="link">x.com/Kalshi</span><br>
• 8.8x · 33h · Greg Isenberg · 4,508 likes, 48 comments<br>
&nbsp;&nbsp;<span class="link">instagram.com/p/Dem8qJFE3Mg</span> · profile <span class="link">instagram.com/gregisenberg</span><br>
<span style="color:#8a8a74">… every post, then every swipe's full copy in the thread</span>
</div>
<p class="note">The same day goes into Notion under Weekly Swipe Drops, one page per week, older weeks kept.</p>
""")

scenes.append("""
<div class="kicker">Need links right now?</div>
<h2>Ask in #tagada-swipes, get every link <em>in one go</em></h2>
<div class="ask"><code>@Claude banging Instagram posts</code><span>Today's Instagram bangers: post link, profile link, score, age and numbers</span></div>
<div class="ask"><code>@Claude top 5 X and LinkedIn posts from the last 48 hours</code><span>Top 5 per platform, never a link it already sent you</span></div>
<div class="ask"><code>@Claude swipes for TagadaPay from today's feed</code><span>Swipes for X, LinkedIn and Instagram, built on those posts</span></div>
<div class="ask"><code>@Claude run a fresh scan</code><span>Replies "scanning now", then new links in about 20 minutes</span></div>
""")

scenes.append("""
<div class="kicker">After we post · nobody types numbers</div>
<h2>Scooby finds our post and <em>compares it</em> with the original</h2>
<div class="flow">
  <div class="box"><b>1. We post</b>Copy a swipe from the Slack thread or Notion Swipes and post it on our account</div>
  <div class="arrow">&rarr;</div>
  <div class="box"><b>2. Next morning</b>Scooby reads our X, LinkedIn and Instagram, spots the post that used the swipe and marks it Posted</div>
  <div class="arrow">&rarr;</div>
  <div class="box"><b>3. Dashboard</b>Our score vs the reference's score, refreshed every day</div>
</div>
<div class="mini"><div><b>3</b>numbers: swipes written, swipes posted, swipe posts vs our usual</div><div><b>1</b>tracker: each swipe, ours vs reference</div><div><b>Live</b>reads Notion, nothing to update</div></div>
""")

scenes.append("""
<div class="kicker">Planning the month</div>
<h2>Paste the calendar, get <em>references and copy</em></h2>
<div class="flow">
  <div class="box"><b>You paste</b>Into the Calendar Inbox in Notion:<br>Nov 4 · TagadaPay · LinkedIn · "Reserves explained"</div>
  <div class="arrow">&rarr;</div>
  <div class="box"><b>Scooby finds</b>3 to 5 proven posts on the same platform and format, each checked and linked</div>
  <div class="arrow">&rarr;</div>
  <div class="box"><b>You get</b>Hook, full copy, two alt hooks and design direction, in the Content Calendar</div>
</div>
<p class="note">It picks up new calendar rows on the next morning run.</p>
""")

scenes.append("""
<div class="kicker">Cheat sheet</div>
<h2>Where Scooby lives</h2>
<div class="where">
  <div><em>#tagada-swipes:</em> the daily drop at 8:45am IST, swipes in the thread</div>
  <div><em>@Claude in #tagada-swipes:</em> links, swipes or a fresh scan on demand</div>
  <div><em>Notion › Weekly Swipe Drops:</em> every day's posts, screenshots and swipes</div>
  <div><em>Notion › Swipes:</em> all swipes with status (Ready, Needs confirmation, Posted)</div>
  <div><em>Dashboard:</em> how each swipe we posted did against its reference</div>
  <div><em>⚠️ or [brackets]:</em> check before posting · never names Stripe, PayPal or Shopify</div>
  <div><em>Next:</em> @Scooby for the whole team, like Berry, on a Claude Team plan</div>
</div>
""")

for i, body in enumerate(scenes, 1):
    html = f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{body}{FOOT.format(n=i, total=len(scenes))}</body></html>"
    (HERE / f"scene{i}.html").write_text(html)
print(len(scenes), "scenes")
