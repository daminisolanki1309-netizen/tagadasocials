// Renders scene*.html to PNG at 2x for a sharp video.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 750 }, deviceScaleFactor: 1.6 });
  for (let i = 1; i <= 10; i++) {
    await page.goto('file://' + path.join(__dirname, `scene${i}.html`));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(__dirname, `scene${i}.png`) });
  }
  await browser.close();
})();
