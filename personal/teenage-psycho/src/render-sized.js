const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1575, height: 2475 } });
  await p.goto('file://' + __dirname + '/cover-sized.html');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  await p.screenshot({ path: __dirname + '/cover.png' });
  await b.close();
})();
