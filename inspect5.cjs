const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERR: ' + e.message));
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' }).catch(e => errors.push('GOTO:'+e.message));
  await page.waitForTimeout(8000);
  const info = await page.evaluate(() => {
    const c = document.querySelector('#root > div > div:first-child canvas');
    return { hasCanvas: !!c, w: c?Math.round(c.getBoundingClientRect().width):0, h: c?Math.round(c.getBoundingClientRect().height):0 };
  });
  console.log('CANVAS:', JSON.stringify(info));
  console.log('ERRORS:', JSON.stringify(errors.slice(0,10)));
  await browser.close();
})();
