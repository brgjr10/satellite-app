const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERR: ' + e.message.slice(0,140)));
  page.on('console', m => { if (m.type()==='error') errors.push('CONSOLE: ' + m.text().slice(0,140)); });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' }).catch(()=>{});
  await page.waitForTimeout(5000);

  // Drive the Cesium camera from globe altitude down to street level via the exposed viewer
  const result = await page.evaluate(async () => {
    const root = document.querySelector('#root > div > div:first-child');
    // Cesium viewer is attached to this container; reach it is not exposed, so emulate wheel zoom.
    return { note: 'wheel-zoom test' };
  });

  // Simulate deep zoom via mouse wheel over the canvas
  const box = await page.evaluate(() => {
    const c = document.querySelector('#root > div > div:first-child canvas');
    const r = c.getBoundingClientRect();
    return { x: r.x + r.width/2, y: r.y + r.height/2 };
  });
  await page.mouse.move(box.x, box.y);
  for (let i=0;i<60;i++){ await page.mouse.wheel(0, -120); await page.waitForTimeout(40); }
  await page.waitForTimeout(2000);
  const zoomed = await page.evaluate(() => {
    const c = document.querySelector('#root > div > div:first-child canvas');
    return c ? Math.round(c.getBoundingClientRect().width) : 0;
  });

  console.log('ZOOMED canvas width:', zoomed);
  console.log('ERRORS:', JSON.stringify(errors.slice(0,8)));
  await browser.close();
})();
