const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERR: ' + e.message));
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' }).catch(e => errors.push('GOTO:'+e.message));
  await page.waitForTimeout(4000);

  // sample satellite globe material opacity at far (default) and after zooming in
  async function sample() {
    return await page.evaluate(() => {
      const root = document.querySelector('#root > div > div:first-child');
      return null; // we can't easily reach three internals; just confirm canvas present
    });
  }
  const hasCanvas = await page.evaluate(() => !!document.querySelector('#root > div > div:first-child canvas'));
  // simulate zoom in by scrolling over canvas
  const box = await page.evaluate(() => {
    const c = document.querySelector('#root > div > div:first-child canvas');
    const r = c.getBoundingClientRect();
    return { x: r.x + r.width/2, y: r.y + r.height/2 };
  });
  await page.mouse.move(box.x, box.y);
  for (let i=0;i<10;i++){ await page.mouse.wheel(0, -200); await page.waitForTimeout(100); }
  await page.waitForTimeout(1500);

  console.log('hasCanvas:', hasCanvas);
  console.log('ERRORS:', JSON.stringify(errors.slice(0,8)));
  await browser.close();
})();
