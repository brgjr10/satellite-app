const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  for (const s of [{w:1440,h:900,n:'WIDE'},{w:500,h:900,n:'PORTRAIT'},{w:1200,h:700,n:'WIDE2'}]) {
    const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' }).catch(()=>{});
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => {
      const c = document.querySelector('#root > div > div:first-child canvas');
      if (!c) return { err: 'no canvas' };
      const cr = c.getBoundingClientRect();
      return { cw: Math.round(cr.width), ch: Math.round(cr.height), aspect: +(cr.width/cr.height).toFixed(3) };
    });
    console.log(s.n, JSON.stringify(r));
    await page.close();
  }
  await browser.close();
})();
