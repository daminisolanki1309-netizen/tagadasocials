// Pulls customer voice from Trustpilot, Reddit search and forum threads with a real browser.
// node voc_fetch.js out.json trustpilot:tagada.io reddit:"query" thread:https://...
const { chromium } = require('playwright');
const fs = require('fs');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
(async () => {
  const [outFile, ...jobs] = process.argv.slice(2);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ userAgent: UA, locale: 'en-US', viewport: { width: 1200, height: 1600 } });
  const page = await ctx.newPage();
  const out = [];
  for (const job of jobs) {
    const [kind, ...rest] = job.split(':'); const arg = rest.join(':');
    try {
      if (kind === 'trustpilot') {
        for (let p = 1; p <= 4; p++) {
          await page.goto(`https://www.trustpilot.com/review/${arg}?page=${p}&sort=recency`, { waitUntil: 'domcontentloaded', timeout: 45000 });
          await page.waitForTimeout(3000);
          const reviews = await page.evaluate(() => [...document.querySelectorAll('article')].map(a => {
            const link = a.querySelector('a[href*="/reviews/"]');
            const rating = a.querySelector('[data-service-review-rating]');
            const name = a.querySelector('[data-consumer-name-typography], span[class*="consumerName"]');
            const country = a.querySelector('[data-consumer-country-typography]');
            const date = a.querySelector('time');
            const title = a.querySelector('h2');
            const body = a.querySelector('p[data-service-review-text-typography], [data-service-review-text-typography]');
            return { url: link ? link.href : null, rating: rating ? rating.getAttribute('data-service-review-rating') : null, name: name ? name.innerText : null, country: country ? country.innerText : null, date: date ? date.getAttribute('datetime') : null, title: title ? title.innerText : null, text: body ? body.innerText : a.innerText.slice(0, 600) };
          }));
          if (!reviews.length) break;
          reviews.forEach(r => out.push({ source: 'Trustpilot', ...r }));
        }
      } else if (kind === 'reddit') {
        await page.goto(`https://www.reddit.com/search/?q=${encodeURIComponent(arg)}&type=posts&sort=top&t=year`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForTimeout(6000);
        const posts = await page.evaluate(() => [...document.querySelectorAll('a[href*="/comments/"]')].map(a => ({ url: a.href.split('?')[0], title: a.innerText.trim() })).filter(x => x.title.length > 15));
        const seen = new Set();
        posts.filter(p => !seen.has(p.url) && seen.add(p.url)).slice(0, 12).forEach(p => out.push({ source: 'Reddit search', query: arg, ...p }));
      } else if (kind === 'thread') {
        await page.goto(arg, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForTimeout(4000);
        const t = await page.evaluate(() => document.body.innerText);
        out.push({ source: 'Thread', url: arg, title: await page.title(), text: t.replace(/\s+/g, ' ').slice(0, 5000) });
      }
      console.error(`${kind} ${arg}: ok (${out.length} total)`);
    } catch (e) { out.push({ source: kind, arg, error: String(e).slice(0, 150) }); }
    await page.waitForTimeout(1500);
  }
  fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
  await browser.close();
})();
