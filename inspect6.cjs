const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const failed = [];
  page.on('requestfailed', r => failed.push('FAIL ' + r.url().slice(0,90) + ' :: ' + (r.failure()?.errorText||'')));
  page.on('response', r => { if (r.status() >= 400) failed.push('HTTP ' + r.status() + ' ' + r.url().slice(0,110)); });
  page.on('pageerror', e => failed.push('PAGEERR: ' + e.message.slice(0,120)));
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' }).catch(()=>{});
  await page.waitForTimeout(8000);
  console.log(failed.slice(0,20).join('\n'));
  await browser.close();
})();
