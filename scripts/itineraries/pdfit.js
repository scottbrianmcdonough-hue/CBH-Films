const {chromium} = require('playwright');
(async () => {
  const dir = '/home/user/CBH-Films/out/itineraries/';
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: 1400, height: 900}});
  await p.goto('file://' + dir + 'lake-district-itinerary-page-mockup.html', {waitUntil: 'load'});
  await p.addStyleTag({content: 'header{position:static!important}'});
  await p.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; }));  // print every FAQ answer, not just the first
  for (const s of await p.$$('svg')) {
    const bb = await s.boundingBox();
    if (bb && bb.height > 500) { await s.screenshot({path: '/dev/shm/map.png'}); break; }
  }
  await p.pdf({path: dir + 'lake-district-itinerary-page-mockup.pdf', width: '1400px', printBackground: true});
  await b.close();
})();
