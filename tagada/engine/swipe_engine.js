// Tagada swipe engine: finds outlier posts, checks links, takes screenshots, saves backups.
// Usage (NODE_PATH=$(npm root -g) NODE_USE_ENV_PROXY=1, so fetch() goes through the session proxy):
//   node swipe_engine.js xscan     out.json handle1 handle2 ...        recent X posts + outlier score
//   node swipe_engine.js liscan    out.json companySlug1 ...           recent LinkedIn company posts + outlier score
//   node swipe_engine.js igscan    out.json username1 ...              recent Instagram posts (may be rate limited)
//   node swipe_engine.js metascan  out.json "query 1" "query 2" ...    active US Meta ads, oldest (longest running) first
//   node swipe_engine.js verify    out.json urls.txt [shotDir]         check every URL, metrics, screenshot, backup
//   node swipe_engine.js ttscan    out.json handle1 handle2 ...        recent TikTok videos of each account + outlier score (views)
//   node swipe_engine.js ttfind    out.json tag1 tag2 ...              TikTok videos from tag pages, with views and creator followers
//   node swipe_engine.js postscan  out.json urls.txt                   check single post links (TikTok, LinkedIn creators) and score
//                                                                      each against the same account's other checked posts
// Engagement = likes + 2 x replies + 3 x reposts. Outlier score = post engagement / account median.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const median = a => { const s = a.filter(x => x != null).sort((x, y) => x - y); if (!s.length) return null; const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const eng = (l, r, p) => (l || 0) + 2 * (r || 0) + 3 * (p || 0);
const num = s => { if (s == null) return null; s = String(s).trim().replace(/,/g, ''); const m = s.match(/^([\d.]+)\s*([KkMm]?)/); if (!m) return null; let v = parseFloat(m[1]); if (/k/i.test(m[2])) v *= 1e3; if (/m/i.test(m[2])) v *= 1e6; return Math.round(v); };

async function newCtx() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ userAgent: UA, viewport: { width: 1200, height: 1500 }, locale: 'en-US' });
  return { browser, ctx };
}

// ---------- platform helpers ----------
function detect(url) {
  const u = url.trim();
  let m;
  if ((m = u.match(/(?:x|twitter)\.com\/([^/]+)\/status(?:es)?\/(\d+)/i))) return { platform: 'X', handle: m[1], id: m[2] };
  if ((m = u.match(/instagram\.com\/(?:[^/]+\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i))) return { platform: 'Instagram', code: m[2] };
  if ((m = u.match(/linkedin\.com\/.*?(?:activity|ugcPost|share)[-:](\d{15,})/i))) return { platform: 'LinkedIn', urn: m[0].match(/ugcPost/i) ? `urn:li:ugcPost:${m[1]}` : `urn:li:activity:${m[1]}` };
  if ((m = u.match(/tiktok\.com\/@([^/]+)\/(?:video|photo)\/(\d+)/i))) return { platform: 'TikTok', handle: m[1], id: m[2] };
  if ((m = u.match(/facebook\.com\/ads\/library\/?\?(?:.*&)?id=(\d+)/i))) return { platform: 'Meta ad', id: m[1] };
  if (/facebook\.com\/ads\/library/i.test(u)) return { platform: 'Meta search' };
  if (/(?:x|twitter)\.com\/[A-Za-z0-9_]+\/?$/i.test(u) || /instagram\.com\/[A-Za-z0-9_.]+\/?$/i.test(u) || /linkedin\.com\/(company|in)\//i.test(u)) return { platform: 'Profile' };
  return { platform: 'Web' };
}

async function xTweet(id) {
  // Public embed data. No login, no API key.
  const r = await fetch(`https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=${Math.random().toString(36).slice(2, 8)}`, { headers: { 'user-agent': UA } });
  if (r.status === 404) return { status: 'Broken', note: 'X says this post does not exist (deleted or private)' };
  if (!r.ok) return { status: 'Unchecked', note: `X embed data answered ${r.status}` };
  const t = await r.text();
  if (!t.trim()) return { status: 'Broken', note: 'X returned no data (deleted, private or age-restricted)' };
  const d = JSON.parse(t);
  if (d.__typename === 'TweetTombstone') return { status: 'Broken', note: 'X shows a tombstone (deleted or restricted)' };
  const text = (d.note_tweet && d.note_tweet.note_tweet_results && d.note_tweet.note_tweet_results.result && d.note_tweet.note_tweet_results.result.text) || d.text;
  return {
    status: 'Opens', author: d.user && d.user.name, handle: d.user && d.user.screen_name,
    profile: d.user ? `https://x.com/${d.user.screen_name}` : null,
    canonical: d.user ? `https://x.com/${d.user.screen_name}/status/${id}` : null,
    posted: d.created_at, text, likes: d.favorite_count, replies: d.conversation_count, reposts: null, views: null,
    media: (d.mediaDetails || []).map(m => m.type),
    noLogin: `https://platform.twitter.com/embed/Tweet.html?id=${id}`,
  };
}

async function pageText(page) { return page.evaluate(() => document.body ? document.body.innerText : ''); }

async function igPostPage(ctx, code) {
  // Fallback for posts whose owner turned off embedding (common on collab reels): the normal post
  // page still carries "832 likes, 31 comments - user on July 27, 2026: "caption"" in og:description.
  const page = await ctx.newPage();
  await page.goto(`https://www.instagram.com/p/${code}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);
  const og = await page.evaluate(() => { const m = document.querySelector('meta[property="og:description"]'); return m ? m.content : null; });
  if (!og) return { status: 'Broken', note: 'Instagram shows no post at this link (deleted, private or region-locked)', page };
  const m = og.match(/^([\d.,]+[KkMm]?) likes?, ([\d.,]+[KkMm]?) comments? - ([A-Za-z0-9_.]+) on ([A-Za-z]+ \d{1,2}, \d{4}): "?([\s\S]*?)"?$/);
  if (!m) return { status: 'Opens', note: 'Opens; numbers not shown', text: og, canonical: `https://www.instagram.com/p/${code}/`, page };
  return { status: 'Opens', note: 'Embedding is off for this post; opened the post page instead', author: m[3], handle: m[3], profile: `https://www.instagram.com/${m[3]}/`, canonical: `https://www.instagram.com/p/${code}/`, likes: num(m[1]), replies: num(m[2]), posted: m[4], text: m[5].slice(0, 1500), noLogin: `https://www.instagram.com/p/${code}/`, page };
}

async function igPost(ctx, code) {
  const r = await igPostEmbed(ctx, code);
  if (r.status !== 'Broken') return r;
  await r.page.close().catch(() => { });
  try { return await igPostPage(ctx, code); } catch (e) { return { status: 'Unchecked', note: String(e).slice(0, 120), page: null }; }
}

async function igPostEmbed(ctx, code) {
  const page = await ctx.newPage();
  try {
    const r = await page.goto(`https://www.instagram.com/p/${code}/embed/captioned/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);
    const t = await pageText(page);
    if (!r || r.status() >= 400 || /isn't available|Sorry, this page|removed/i.test(t) || t.trim().length < 20) return { status: 'Broken', note: 'Instagram embed says the post is unavailable', page };
    const author = (t.match(/^\s*([A-Za-z0-9_.]+)\s*\n/) || [])[1];
    const likes = num((t.match(/([\d.,]+[KkMm]?)\s+likes?/) || [])[1]);
    const comments = num((t.match(/View all ([\d.,]+[KkMm]?) comments/) || [])[1]);
    let caption = t.split(/\blikes?\b/)[1] || '';
    caption = caption.replace(/^\s*[A-Za-z0-9_.]+\s*/, '').replace(/View all [\d,]+ comments[\s\S]*$/, '').replace(/Add a comment[\s\S]*$/, '').trim().slice(0, 1500);
    return { status: 'Opens', author, handle: author, profile: author ? `https://www.instagram.com/${author}/` : null, canonical: `https://www.instagram.com/p/${code}/`, likes, replies: comments, text: caption, noLogin: `https://www.instagram.com/p/${code}/embed/captioned/`, page };
  } catch (e) { return { status: 'Unchecked', note: String(e).slice(0, 120), page }; }
}

async function liPost(ctx, url, urn) {
  const page = await ctx.newPage();
  try {
    const target = /linkedin\.com\/posts\//.test(url) ? url.split('?')[0] : `https://www.linkedin.com/feed/update/${urn}/`;
    const r = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);
    const t = await pageText(page);
    const title = await page.title();
    if (!r || r.status() >= 400 || /Page not found|This page doesn.t exist|post was deleted|isn.t available/i.test(t)) return { status: 'Broken', note: 'LinkedIn says the post is unavailable', page };
    if (/authwall|Sign in to view|Join LinkedIn/i.test(page.url()) && t.length < 800) return { status: 'Login wall', note: 'LinkedIn asks for a login; open it while signed in', page, noLogin: `https://www.linkedin.com/embed/feed/update/${urn}` };
    // Titles look like "Post title | Ramp" or "Post title | Tagada posted on the topic | LinkedIn"
    const parts = title.replace(/\s*\|\s*LinkedIn\s*$/, '').split('|').map(s => s.trim());
    const author = (parts[parts.length - 1] || '').replace(/ posted on the topic$/, '').replace(/['’]s Post$/, '') || null;
    const counts = await page.evaluate(() => {
      const q = s => { const e = document.querySelector(s); return e ? e.innerText.trim() : null; };
      const actor = document.querySelector('a[data-tracking-control-name*="feed-actor-name"], a[data-tracking-control-name*="actor"]');
      return { reactions: q('[data-test-id="social-actions__reaction-count"]'), comments: q('[data-test-id="social-actions__comments"]'), actor: actor ? actor.href.split('?')[0] : null };
    });
    const reactions = num(counts.reactions) || 0;
    const comments = num((counts.comments || '').match(/[\d.,]+[KkMm]?/)) || 0;
    const profile = counts.actor || await page.evaluate(() => { const a = [...document.querySelectorAll('a[href*="linkedin.com/company/"],a[href*="linkedin.com/in/"]')].map(x => x.href.split('?')[0]); return a[0] || null; });
    const body = t.replace(/\s+/g, ' ');
    const startIdx = body.search(/\b\d+(h|d|w|mo|yr)\b/);
    return { status: 'Opens', author, profile, canonical: target, posted: liPosted(target), likes: reactions, replies: comments, text: body.slice(Math.max(0, startIdx), startIdx + 1500), noLogin: `https://www.linkedin.com/embed/feed/update/${urn}`, page };
  } catch (e) { return { status: 'Unchecked', note: String(e).slice(0, 120), page }; }
}

// A TikTok video page carries its full numbers (views, likes, comments, shares, saves) and the
// creator's follower count in the page's own JSON, with no login. Profile video lists come back
// empty to logged-out browsers, so TikTok is read one video at a time.
async function ttVideo(ctx, url) {
  const page = await ctx.newPage();
  try {
    const r = await page.goto(url.split('?')[0], { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3500);
    const html = await page.content();
    const m = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
    const d = m ? (JSON.parse(m[1]).__DEFAULT_SCOPE__ || {})['webapp.video-detail'] : null;
    const it = d && d.itemInfo && d.itemInfo.itemStruct;
    if (!it) return { status: r && r.status() >= 400 ? 'Broken' : 'Unchecked', note: d ? `TikTok status ${d.statusCode} (deleted, private or region-locked)` : 'TikTok page had no video data', page };
    const st = it.stats || {};
    const h = it.author.uniqueId;
    return {
      status: 'Opens', author: it.author.nickname, handle: h, profile: `https://www.tiktok.com/@${h}`,
      canonical: `https://www.tiktok.com/@${h}/video/${it.id}`, posted: new Date(+it.createTime * 1000).toISOString(),
      text: it.desc, likes: num(st.diggCount), replies: num(st.commentCount), reposts: num(st.shareCount), saves: num(st.collectCount),
      views: num(st.playCount), followers: it.authorStats ? num(it.authorStats.followerCount) : null,
      noLogin: `https://www.tiktok.com/embed/v2/${it.id}`, page,
    };
  } catch (e) { return { status: 'Unchecked', note: String(e).slice(0, 120), page }; }
}

// A LinkedIn activity ID carries its own timestamp: the top bits are milliseconds since 1970.
function liPosted(url) {
  const m = String(url).match(/activity[-:](\d{19})/);
  return m ? new Date(Number(BigInt(m[1]) >> 22n)).toISOString() : null;
}

async function metaAd(ctx, id) {
  const page = await ctx.newPage();
  try {
    await page.goto(`https://www.facebook.com/ads/library/?id=${id}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(7000);
    // An ?id= link opens the advertiser's whole ad grid with the requested ad in a "Link to ad"
    // dialog on top. Read (and later screenshot) only that dialog, never the grid behind it.
    const dlg = page.locator('div[role="dialog"]').filter({ hasText: id }).first();
    const hasDlg = await dlg.count().then(n => n > 0).catch(() => false);
    const t = hasDlg ? await dlg.innerText() : await pageText(page);
    if (hasDlg) page._swipeTarget = dlg;
    if (!/Library ID/i.test(t)) return { status: 'Broken', note: 'Ad Library shows no ad for this ID', page };
    const started = (t.match(/Started running on ([A-Za-z]{3} \d{1,2}, \d{4})/) || [])[1];
    const active = /\bActive\b/.test(t) && !/\bInactive\b/.test(t.slice(0, 600));
    const days = started ? Math.round((Date.now() - Date.parse(started)) / 864e5) : null;
    const adv = (t.match(/See ad details\s*\n\s*(.+?)\s*\n\s*Sponsored/) || t.match(/\n(.+?)\s*\n\s*Sponsored/) || [])[1];
    const body = (t.split('Sponsored')[1] || '').trim().slice(0, 1500);
    return { status: 'Opens', author: adv, posted: started, daysRunning: days, active, text: body, canonical: `https://www.facebook.com/ads/library/?id=${id}`, noLogin: `https://www.facebook.com/ads/library/?id=${id}`, page };
  } catch (e) { return { status: 'Unchecked', note: String(e).slice(0, 120), page }; }
}

async function metaSearch(ctx, url) {
  // An Ad Library page or search link: it shows a "Log in" button but the ads load without one.
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(7000);
    const t = await pageText(page);
    const n = (t.match(/~?([\d,]+) results?/) || [])[1];
    if (/No ads match/i.test(t)) return { status: 'Opens', note: 'Ad Library opens; no active ads match right now', text: '', canonical: url, page };
    if (/Library ID/.test(t) || n) return { status: 'Opens', note: n ? `${n} results` : '', text: (t.split('Sponsored')[1] || '').trim().slice(0, 600), canonical: url, noLogin: url, page };
    return { status: 'Unchecked', note: 'Ad Library page did not load ads', page };
  } catch (e) { return { status: 'Unchecked', note: String(e).slice(0, 120), page }; }
}

async function webPage(ctx, url) {
  const page = await ctx.newPage();
  try {
    const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3500);
    const t = await pageText(page);
    const code = r ? r.status() : 0;
    const title = await page.title();
    const bad = /Page not found|404|doesn.t exist|no longer available|This content isn.t available/i.test(title) || (code >= 400 && t.length < 400);
    const wall = /log ?in|sign ?in|join now/i.test(t.slice(0, 400)) && t.length < 900;
    return { status: bad ? 'Broken' : wall ? 'Login wall' : 'Opens', note: `HTTP ${code}${code === 403 && !bad ? ' (site bot filter; page still renders in a browser)' : ''}`, title, text: t.replace(/\s+/g, ' ').slice(0, 600), canonical: page.url(), page };
  } catch (e) { return { status: 'Unchecked', note: String(e).slice(0, 120), page }; }
}

async function wayback(url, lookupOnly = false) {
  // 1) existing snapshot  2) ask Save Page Now  3) give up quietly (the Notion screenshot is the fallback)
  try {
    const a = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(20000) });
    const j = await a.json();
    if (j.archived_snapshots && j.archived_snapshots.closest && j.archived_snapshots.closest.available) return j.archived_snapshots.closest.url.replace(/^http:/, 'https:');
  } catch (e) { }
  if (lookupOnly) return null;
  try {
    const s = await fetch(`https://web.archive.org/save/${url}`, { redirect: 'manual', headers: { 'user-agent': UA }, signal: AbortSignal.timeout(90000) });
    const loc = s.headers.get('location') || s.headers.get('content-location');
    if (loc) return loc.startsWith('http') ? loc : `https://web.archive.org${loc}`;
  } catch (e) { }
  return null;
}

// ---------- verify ----------
async function verify(urls, shotDir) {
  fs.mkdirSync(shotDir, { recursive: true });
  const { browser, ctx } = await newCtx();
  const results = [];
  for (const [i, url] of urls.entries()) {
    const d = detect(url);
    let res = { url, platform: d.platform, checkedAt: new Date().toISOString() };
    let page = null, shotTarget = null;
    try {
      if (d.platform === 'X') {
        Object.assign(res, await xTweet(d.id));
        shotTarget = `https://platform.twitter.com/embed/Tweet.html?id=${d.id}`;
        if (res.likes != null) res.engagement = eng(res.likes, res.replies, res.reposts);
      } else if (d.platform === 'Instagram') {
        const r = await igPost(ctx, d.code); page = r.page; delete r.page; Object.assign(res, r);
      } else if (d.platform === 'LinkedIn') {
        const r = await liPost(ctx, url, d.urn); page = r.page; delete r.page; Object.assign(res, r);
        if (res.status === 'Opens') shotTarget = res.noLogin;
      } else if (d.platform === 'TikTok') {
        const r = await ttVideo(ctx, url); page = r.page; delete r.page; Object.assign(res, r);
      } else if (d.platform === 'Meta ad') {
        const r = await metaAd(ctx, d.id); page = r.page; delete r.page; Object.assign(res, r);
      } else if (d.platform === 'Meta search') {
        const r = await metaSearch(ctx, url); page = r.page; delete r.page; Object.assign(res, r);
      } else {
        const r = await webPage(ctx, url); page = r.page; delete r.page; Object.assign(res, r);
      }
      if (res.likes != null && res.engagement == null) res.engagement = eng(res.likes, res.replies, res.reposts);
      if (res.status === 'Opens' || res.status === 'Login wall') {
        const shot = path.join(shotDir, `${String(i).padStart(3, '0')}_${d.platform.replace(/\W/g, '')}.png`);
        if (shotTarget) { if (page) await page.close(); page = await ctx.newPage(); await page.goto(shotTarget, { waitUntil: 'domcontentloaded', timeout: 45000 }); await page.waitForTimeout(4000); }
        if (page && page._swipeTarget) {
          await page._swipeTarget.screenshot({ path: shot });
          res.screenshot = shot;
        } else if (page) {
          // crop to the visible content so the image is the post, not a blank page
          const box = await page.evaluate(() => { const els = [...document.body.querySelectorAll('*')]; let h = 0; for (const e of els) { const r = e.getBoundingClientRect(); if (r.height > 0 && r.width > 0) h = Math.max(h, r.bottom + window.scrollY); } return Math.min(Math.max(h, 300), 2400); });
          await page.setViewportSize({ width: 1200, height: Math.ceil(box) + 20 });
          await page.screenshot({ path: shot, fullPage: false });
          res.screenshot = shot;
        }
      }
    } catch (e) { res.status = res.status || 'Unchecked'; res.note = (res.note || '') + ' ' + String(e).slice(0, 120); }
    if (page) await page.close().catch(() => { });
    // Save Page Now refuses this server, so only look up existing snapshots unless WAYBACK_SAVE=1.
    if (res.status === 'Opens') res.backup = await wayback(res.canonical || url, process.env.WAYBACK_SAVE !== '1');
    results.push(res);
    console.error(`[${i + 1}/${urls.length}] ${res.status} ${d.platform} ${url}`);
    await sleep(800);
  }
  await browser.close();
  return results;
}

// ---------- check: fast status + numbers, no screenshots (for re-checking old rows) ----------
async function check(urls) {
  const { browser, ctx } = await newCtx();
  const results = [];
  for (const [i, url] of urls.entries()) {
    const d = detect(url);
    let res = { url, platform: d.platform, checkedAt: new Date().toISOString() };
    try {
      let r;
      if (d.platform === 'X') r = await xTweet(d.id);
      else if (d.platform === 'Instagram') r = await igPost(ctx, d.code);
      else if (d.platform === 'LinkedIn') r = await liPost(ctx, url, d.urn);
      else if (d.platform === 'TikTok') r = await ttVideo(ctx, url);
      else if (d.platform === 'Meta ad') r = await metaAd(ctx, d.id);
      else if (d.platform === 'Meta search') r = await metaSearch(ctx, url);
      else r = await webPage(ctx, url);
      if (r.page) { await r.page.close().catch(() => { }); delete r.page; }
      Object.assign(res, r);
      if (res.text) res.text = res.text.slice(0, 280);
    } catch (e) { res.status = 'Unchecked'; res.note = String(e).slice(0, 120); }
    if (res.status === 'Broken') res.backup = await wayback(url, true);
    results.push(res);
    console.error(`[${i + 1}/${urls.length}] ${res.status} ${url}`);
    await sleep(d.platform === 'X' ? 300 : 1200);
  }
  await browser.close();
  return results;
}

// ---------- scans ----------
async function xscan(handles, days = 8, partialFile = null) {
  // X rate-limits this endpoint at roughly 30 profiles per 15 minutes, so pace at ~25s per
  // profile and save after every one; a stall never loses what was already collected.
  const { browser, ctx } = await newCtx();
  const page = await ctx.newPage();
  const out = [];
  for (const [hi, h] of handles.entries()) {
    if (hi) await sleep(25000);
    if (partialFile) fs.writeFileSync(partialFile, JSON.stringify(out, null, 1));
    const handle = h.replace(/^@/, '');
    let tries = 0, entries = null;
    while (tries++ < 3 && !entries) {
      try {
        const r = await page.goto(`https://syndication.twitter.com/srv/timeline-profile/screen-name/${handle}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        const html = await page.content();
        const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
        if (m) entries = JSON.parse(m[1]).props.pageProps.timeline.entries;
        else await sleep(60000 * tries);
      } catch (e) { await sleep(10000); }
    }
    if (!entries) { out.push({ account: handle, error: 'timeline unavailable (rate limit or private)' }); continue; }
    const posts = entries.map(e => e.content && e.content.tweet).filter(Boolean)
      .filter(t => !t.retweeted_status && !t.in_reply_to_status_id_str)
      .map(t => ({ id: t.id_str, url: `https://x.com/${handle}/status/${t.id_str}`, posted: new Date(t.created_at).toISOString(), text: t.full_text, likes: t.favorite_count, replies: t.reply_count, reposts: t.retweet_count, quotes: t.quote_count, views: t.views && num(t.views.count), media: ((t.extended_entities || t.entities || {}).media || []).map(m => m.type) }));
    posts.forEach(p => p.engagement = eng(p.likes, p.replies, p.reposts));
    const med = median(posts.map(p => p.engagement));
    const cutoff = Date.now() - days * 864e5;
    posts.forEach(p => { p.outlier = med ? +(p.engagement / med).toFixed(1) : null; p.inWindow = Date.parse(p.posted) >= cutoff; });
    out.push({ account: handle, profile: `https://x.com/${handle}`, sampled: posts.length, median: med, posts });
    console.error(`x ${handle}: ${posts.length} posts, median ${med}`);
  }
  await browser.close();
  return out;
}

async function liscan(slugs, days = 8) {
  // LinkedIn shows a login wall after a few page views in one session, so each company
  // gets a fresh browser context, a long pause, and one retry.
  const browser = await chromium.launch();
  const out = [];
  for (const slug of slugs) {
    let res = null;
    for (let attempt = 0; attempt < 2 && (!res || !res.sampled); attempt++) {
      if (attempt) await sleep(45000);
      const ctx = await browser.newContext({ userAgent: UA, viewport: { width: 1200, height: 1500 }, locale: 'en-US' });
      res = (await liscanOne(ctx, slug, days));
      await ctx.close();
    }
    out.push(res);
    console.error(`li ${slug}: ${res.sampled || 0} posts, median ${res.median}`);
    await sleep(12000 + Math.random() * 8000);
  }
  await browser.close();
  return out;
}

async function liscanOne(ctx, slug, days) {
  const page = await ctx.newPage();
  const out = [];
  const slugs = [slug];
  const ageDays = s => { const m = s.match(/^(\d+)(h|d|w|mo|yr)$/); if (!m) return null; const n = +m[1]; return { h: n / 24, d: n, w: n * 7, mo: n * 30, yr: n * 365 }[m[2]]; };
  for (const slug of slugs) {
    const base = slug.startsWith('http') ? slug.replace(/\/$/, '') : `https://www.linkedin.com/company/${slug}`;
    try {
      await page.goto(base + '/', { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(5000);
      // each update card on the public page
      const cards = await page.evaluate(() => [...document.querySelectorAll('article, li')].map(el => {
        const a = el.querySelector('a[href*="/posts/"], a[href*="activity"]');
        return a ? { href: a.href.split('?')[0], text: el.innerText } : null;
      }).filter(Boolean));
      const seen = new Set(); const posts = [];
      for (const c of cards) {
        if (seen.has(c.href) || !/activity-\d+|activity:\d+/.test(c.href)) continue; seen.add(c.href);
        const lines = c.text.split('\n').map(s => s.trim()).filter(Boolean);
        const age = lines.find(l => /^\d+(h|d|w|mo|yr)$/.test(l.replace(/\s*Edited$/, '')));
        const ci = lines.findIndex(l => /^\d[\d,.]*[KkMm]?\s+Comments?$/.test(l));
        const comments = ci >= 0 ? num(lines[ci]) : 0;
        const likeLine = ci > 0 && /^\d[\d,.]*[KkMm]?$/.test(lines[ci - 1]) ? lines[ci - 1] : lines.find((l, i) => /^\d[\d,.]*[KkMm]?$/.test(l) && i > 2 && lines[i + 1] === 'Like');
        const reactions = likeLine ? num(likeLine) : 0;
        const author = lines[0];
        posts.push({ url: c.href, author, ageDays: age ? ageDays(age.replace(/\s*Edited$/, '')) : null, text: lines.slice(2, 14).join(' ').slice(0, 700), likes: reactions, replies: comments, engagement: eng(reactions, comments, 0) });
      }
      const med = median(posts.map(p => p.engagement));
      posts.forEach(p => { p.outlier = med ? +(p.engagement / med).toFixed(1) : null; p.inWindow = p.ageDays != null && p.ageDays <= days; });
      out.push({ account: slug, profile: base + '/', sampled: posts.length, median: med, posts });
    } catch (e) { out.push({ account: slug, error: String(e).slice(0, 120) }); }
  }
  return out[0];
}

// The public profile embed (instagram.com/<user>/embed/) carries the 6 newest posts with likes,
// comments and timestamps and needs no login. Carousel children also carry a shortcode but no
// timestamp, so only nodes with taken_at_timestamp count as posts.
async function igEmbedProfile(page, u) {
  await page.goto(`https://www.instagram.com/${u}/embed/`, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => { });
  await page.waitForTimeout(3000);
  const raw = await page.content();
  if (/profile may have been removed/i.test(raw)) return { notFound: true };
  const html = raw.replace(/\\"/g, '"').replace(/\\\//g, '/');
  const followers = num((html.match(/"edge_followed_by":\{"count":(\d+)/) || [])[1]);
  const parts = html.split('"shortcode":"').slice(1);
  const posts = [];
  for (const seg of parts) {
    const code = seg.slice(0, seg.indexOf('"'));
    const body = seg.slice(0, 6000);
    const ts = (body.match(/"taken_at_timestamp":(\d+)/) || [])[1];
    const likes = (body.match(/"edge_liked_by":\{"count":(\d+)/) || [])[1];
    if (!ts || likes === undefined || posts.some(p => p.code === code)) continue;
    const cap = (body.match(/"edge_media_to_caption":\{"edges":\[\{"node":\{"text":"((?:[^"\\]|\\.)*)"/) || [])[1];
    const text = (cap || '').replace(/\\u([0-9a-fA-F]{4})/g, (m, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\n/g, '\n').replace(/\\(.)/g, '$1');
    posts.push({ code, isVideo: /"is_video":true/.test(body.slice(0, 1500)), likes: +likes, replies: num((body.match(/"edge_media_to_comment":\{"count":(\d+)/) || [])[1]) || 0, views: num((body.match(/"video_view_count":(\d+)/) || [])[1]), posted: +ts, text });
  }
  return posts.length ? { followers, posts } : null;
}

async function igscan(users, days = 8) {
  const { browser, ctx } = await newCtx();
  const page = await ctx.newPage();
  const out = [];
  for (const u0 of users) {
    const u = u0.replace(/^@/, '');
    let res = await igEmbedProfile(page, u).catch(() => null);
    if (res && res.notFound) {
      // Instagram's own "profile may have been removed" page: the handle is wrong, not rate limited.
      out.push({ account: u, error: 'Handle not found on Instagram; check the spelling in the watchlist' });
      console.error(`ig ${u}: handle not found`);
      await sleep(3000);
      continue;
    }
    if (res) {
      const posts = res.posts.map(p => ({ ...p, url: `https://www.instagram.com/p/${p.code}/`, posted: new Date(p.posted * 1000).toISOString(), engagement: eng(p.likes, p.replies, 0) }));
      const med = median(posts.map(p => p.engagement));
      posts.forEach(p => { p.outlier = med ? +(p.engagement / med).toFixed(1) : null; p.inWindow = Date.parse(p.posted) >= Date.now() - days * 864e5; });
      out.push({ account: u, profile: `https://www.instagram.com/${u}/`, followers: res.followers, sampled: posts.length, median: med, source: 'profile embed', posts });
      console.error(`ig ${u}: ${posts.length} posts via embed, median ${med}`);
      await sleep(6000 + Math.random() * 4000);
      continue;
    }
    if (!page.url().startsWith('https://www.instagram.com/')) await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => { });
    for (let t = 0; t < 2 && !res; t++) {
      res = await page.evaluate(async (u) => {
        const r = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${u}`, { headers: { 'x-ig-app-id': '936619743392459' } });
        if (!r.ok) return { err: r.status };
        const d = await r.json(); const us = d.data.user;
        return { followers: us.edge_followed_by.count, posts: us.edge_owner_to_timeline_media.edges.map(e => ({ code: e.node.shortcode, type: e.node.__typename, isVideo: e.node.is_video, likes: e.node.edge_liked_by ? e.node.edge_liked_by.count : (e.node.edge_media_preview_like || {}).count, replies: (e.node.edge_media_to_comment || {}).count, views: e.node.video_view_count, posted: e.node.taken_at_timestamp, text: ((e.node.edge_media_to_caption.edges[0] || {}).node || {}).text })) };
      }, u).catch(e => ({ err: String(e) }));
      if (res && res.err) { console.error(`ig ${u}: ${res.err}, retry`); res = null; await sleep(20000 * (t + 1)); }
    }
    if (!res) { out.push({ account: u, error: 'Instagram rate limited this IP; use search + verify for this account' }); continue; }
    const posts = res.posts.map(p => ({ ...p, url: `https://www.instagram.com/p/${p.code}/`, posted: new Date(p.posted * 1000).toISOString(), engagement: p.isVideo && p.views ? p.views : eng(p.likes, p.replies, 0) }));
    const med = median(posts.map(p => p.engagement));
    posts.forEach(p => { p.outlier = med ? +(p.engagement / med).toFixed(1) : null; p.inWindow = Date.parse(p.posted) >= Date.now() - days * 864e5; });
    out.push({ account: u, profile: `https://www.instagram.com/${u}/`, followers: res.followers, sampled: posts.length, median: med, posts });
    await sleep(4000);
  }
  await browser.close();
  return out;
}

async function metascan(queries) {
  const { browser, ctx } = await newCtx();
  const page = await ctx.newPage();
  const out = [];
  for (const q of queries) {
    try {
      const url = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=${encodeURIComponent(q)}&search_type=keyword_unordered&media_type=all`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(8000);
      for (let s = 0; s < 3; s++) { await page.mouse.wheel(0, 4000); await page.waitForTimeout(2000); }
      const t = await pageText(page);
      const blocks = t.split(/\n(?=Active\s*\nLibrary ID:|Inactive\s*\nLibrary ID:|Library ID:)/).filter(b => /Library ID: \d+/.test(b));
      const ads = blocks.map(b => {
        const id = (b.match(/Library ID: (\d+)/) || [])[1];
        const started = (b.match(/Started running on ([A-Za-z]{3} \d{1,2}, \d{4})/) || [])[1];
        const adv = (b.match(/See (?:ad|summary) details\s*\n\s*(.+?)\s*\n\s*Sponsored/) || [])[1];
        const multi = (b.match(/(\d+) ads use this creative and text/) || [])[1];
        return { id, url: `https://www.facebook.com/ads/library/?id=${id}`, advertiser: adv, started, daysRunning: started ? Math.round((Date.now() - Date.parse(started)) / 864e5) : null, variants: multi ? +multi : 1, text: (b.split('Sponsored')[1] || '').trim().slice(0, 600) };
      }).filter(a => a.id);
      ads.sort((a, b) => (b.daysRunning || 0) - (a.daysRunning || 0));
      out.push({ query: q, searchUrl: url, count: ads.length, ads });
      console.error(`meta "${q}": ${ads.length} ads`);
    } catch (e) { out.push({ query: q, error: String(e).slice(0, 120) }); }
    await sleep(3000);
  }
  await browser.close();
  return out;
}

// TikTok profile pages don't list videos to logged-out browsers, but an account's own videos show
// up on its discover and tag pages (tiktok.com/discover/<handle>, tiktok.com/tag/<handle>). Keep the
// ones posted by the account itself, open the newest few for their numbers, and score each video's
// views against that account's median, like the other scans.
async function ttscan(handles, perAccount = 8, days = 8) {
  const { browser, ctx } = await newCtx();
  const page = await ctx.newPage();
  const out = [];
  for (const h0 of handles) {
    const h = h0.replace(/^@/, '');
    const own = new Set();
    for (const url of [`https://www.tiktok.com/discover/${h}`, `https://www.tiktok.com/tag/${h}`]) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForTimeout(5000);
        for (let i = 0; i < 2; i++) { await page.mouse.wheel(0, 2000); await page.waitForTimeout(1800); }
        const links = await page.$$eval('a[href*="/video/"]', as => as.map(a => a.href.split('?')[0]));
        links.filter(l => l.toLowerCase().includes(`/@${h.toLowerCase()}/video/`)).forEach(l => own.add(l));
      } catch (e) { }
      await sleep(1500);
    }
    // Video IDs carry their own timestamp, so the biggest IDs are the newest videos.
    const newest = [...own].sort((a, b) => (BigInt(b.split('/video/')[1]) > BigInt(a.split('/video/')[1]) ? 1 : -1)).slice(0, perAccount);
    if (!newest.length) { out.push({ account: h, error: 'No videos by this account on its TikTok tag or discover page' }); console.error(`tt ${h}: no own videos found`); continue; }
    const posts = []; let followers = null;
    for (const url of newest) {
      const r = await ttVideo(ctx, url);
      if (r.page) await r.page.close().catch(() => { });
      if (r.status !== 'Opens') continue;
      followers = r.followers || followers;
      posts.push({ url: r.canonical, posted: r.posted, text: (r.text || '').slice(0, 700), likes: r.likes, replies: r.replies, reposts: r.reposts, saves: r.saves, views: r.views, engagement: r.views != null ? r.views : eng(r.likes, r.replies, r.reposts) });
      await sleep(1200);
    }
    const med = median(posts.map(p => p.engagement));
    posts.forEach(p => { p.outlier = med && posts.length >= 3 ? +(p.engagement / med).toFixed(1) : (followers ? +(p.engagement / followers).toFixed(1) : null); p.inWindow = Date.parse(p.posted) >= Date.now() - days * 864e5; });
    out.push({ account: h, profile: `https://www.tiktok.com/@${h}`, followers, sampled: posts.length, median: med, source: 'tag and discover pages', posts });
    console.error(`tt ${h}: ${posts.length} videos, median views ${med}`);
    await sleep(3000);
  }
  await browser.close();
  return out;
}

// TikTok tag pages list recent videos without a login. Each video is then opened for its numbers.
async function ttfind(tags, perTag = 8) {
  const { browser, ctx } = await newCtx();
  const page = await ctx.newPage();
  const urls = new Set();
  for (const tag of tags) {
    try {
      await page.goto(`https://www.tiktok.com/tag/${tag.replace(/^#/, '')}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(6000);
      const links = await page.$$eval('a[href*="/video/"]', as => as.map(a => a.href.split('?')[0]));
      [...new Set(links)].slice(0, perTag).forEach(u => urls.add(u));
      console.error(`tt #${tag}: ${links.length} links`);
    } catch (e) { console.error(`tt #${tag}: ${String(e).slice(0, 80)}`); }
    await sleep(3000);
  }
  await browser.close();
  return postscan([...urls]);
}

// Checks single post links and scores each one against the other checked posts from the same
// account (views for TikTok, likes + 2 x replies + 3 x reposts elsewhere). Returns the same
// shape as the scans, so feed.py can read it. With only one post from an account, TikTok falls
// back to views divided by followers.
async function postscan(urls) {
  const checked = await check(urls);
  const byAcc = {};
  for (const r of checked) {
    if (r.status !== 'Opens') continue;
    const key = (r.handle || r.author || r.profile || 'unknown').toLowerCase();
    const a = byAcc[key] = byAcc[key] || { account: r.handle || r.author, profile: r.profile, platform: r.platform, followers: r.followers || null, posts: [] };
    a.posts.push({ url: r.canonical || r.url, posted: r.posted, text: (r.text || '').slice(0, 700), likes: r.likes, replies: r.replies, reposts: r.reposts, views: r.views,
      engagement: r.platform === 'TikTok' && r.views != null ? r.views : eng(r.likes, r.replies, r.reposts) });
  }
  const out = Object.values(byAcc);
  for (const a of out) {
    const med = median(a.posts.map(p => p.engagement));
    a.sampled = a.posts.length; a.median = med;
    a.posts.forEach(p => {
      if (a.posts.length >= 3 && med) p.outlier = +(p.engagement / med).toFixed(1);
      else if (a.platform === 'TikTok' && a.followers) p.outlier = +(p.engagement / a.followers).toFixed(1);
      else p.outlier = null;
      p.inWindow = p.posted ? Date.parse(p.posted) >= Date.now() - 8 * 864e5 : false;
    });
  }
  return out;
}

// Matches Tagada's own posts to the swipes they were built on. A swipe's words (4+ letters,
// placeholders in [brackets] dropped) are compared with each post; a post that contains at
// least 60% of a swipe's words on the same platform is that swipe, posted.
function matchSwipes(posts, swipes) {
  const words = s => new Set(String(s || '').toLowerCase().replace(/\[[^\]]*\]/g, ' ').replace(/https?:\/\/\S+/g, ' ').match(/[a-z0-9$%']{4,}/g) || []);
  const out = [];
  for (const p of posts) {
    const pw = words(p.text);
    let best = null;
    for (const s of swipes) {
      if (s.platform && p.platform && s.platform !== p.platform) continue;
      const sw = words(s.copy);
      if (sw.size < 4) continue;
      const hit = [...sw].filter(w => pw.has(w)).length / sw.size;
      if (!best || hit > best.overlap) best = { swipeId: s.id, overlap: +hit.toFixed(2) };
    }
    if (best && best.overlap >= 0.6) out.push({ link: p.link || p.url, platform: p.platform, ...best });
  }
  return out;
}

(async () => {
  const [cmd, outFile, ...args] = process.argv.slice(2);
  if (cmd === 'match') {
    // match out.json posts.json swipes.json; posts: [{link, platform, text}], swipes: [{id, platform, copy}]
    const res = matchSwipes(JSON.parse(fs.readFileSync(args[0], 'utf8')), JSON.parse(fs.readFileSync(args[1], 'utf8')));
    fs.writeFileSync(outFile, JSON.stringify(res, null, 1));
    console.error(`wrote ${outFile}: ${res.length} matches`);
    return;
  }
  let res;
  if (cmd === 'xscan') res = await xscan(args, 8, outFile);
  else if (cmd === 'liscan') res = await liscan(args);
  else if (cmd === 'igscan') res = await igscan(args);
  else if (cmd === 'metascan') res = await metascan(args);
  else if (cmd === 'ttfind') res = await ttfind(args);
  else if (cmd === 'ttscan') res = await ttscan(args);
  else if (cmd === 'postscan') { const urls = fs.readFileSync(args[0], 'utf8').split('\n').map(s => s.trim()).filter(Boolean); res = await postscan(urls); }
  else if (cmd === 'verify') { const urls = fs.readFileSync(args[0], 'utf8').split('\n').map(s => s.trim()).filter(Boolean); res = await verify(urls, args[1] || 'shots'); }
  else if (cmd === 'check') { const urls = fs.readFileSync(args[0], 'utf8').split('\n').map(s => s.trim()).filter(Boolean); res = await check(urls); }
  else { console.error('unknown command'); process.exit(1); }
  fs.writeFileSync(outFile, JSON.stringify(res, null, 1));
  console.error(`wrote ${outFile}`);
})();
