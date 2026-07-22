const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const sizes = [
    { name: 'WIDE 1440x900', width: 1440, height: 900 },
    { name: 'NARROW 500x900 (portrait)', width: 500, height: 900 },
    { name: 'SMALL 800x600', width: 800, height: 600 },
  ];
  for (const s of sizes) {
    const page = await browser.newPage({ viewport: { width: s.width, height: s.height } });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' }).catch(()=>{});
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => {
      const out = {};
      const vh = window.innerHeight, vw = window.innerWidth;
      out.vw = vw; out.vh = vh;
      const root = document.querySelector('#root > div');
      if (root) {
        const r = root.getBoundingClientRect();
        out.rootBottom = Math.round(r.bottom);
        out.rootGap = vh - Math.round(r.bottom);
        out.children = [];
        for (const c of root.children) {
          const cr = c.getBoundingClientRect();
          out.children.push({ cls: c.className.slice(0,40), top: Math.round(cr.top), bottom: Math.round(cr.bottom), h: Math.round(cr.height) });
        }
      }
      return out;
    });
    console.log('=== ' + s.name + ' ===');
    console.log(JSON.stringify(info));
    await page.close();
  }
  await browser.close();
})();
