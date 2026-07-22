const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERR: ' + e.message));
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' }).catch(e => errors.push('GOTO: ' + e.message));
  await page.waitForTimeout(2000);

  const info = await page.evaluate(() => {
    const out = {};
    const vh = window.innerHeight, vw = window.innerWidth;
    out.viewport = { vw, vh };
    const root = document.querySelector('#root > div');
    if (root) {
      const r = root.getBoundingClientRect();
      out.root = { top: r.top, bottom: r.bottom, height: r.height, bottomGap: vh - r.bottom };
    }
    const children = root ? root.children : [];
    out.children = [];
    for (const c of children) {
      const r = c.getBoundingClientRect();
      out.children.push({ cls: c.className.slice(0,60), top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height) });
    }
    out.bodyBg = getComputedStyle(document.body).backgroundColor;
    out.htmlH = document.documentElement.getBoundingClientRect().height;
    return out;
  });
  console.log(JSON.stringify(info, null, 2));
  console.log('ERRORS:', JSON.stringify(errors.slice(0,5)));
  await browser.close();
})();
