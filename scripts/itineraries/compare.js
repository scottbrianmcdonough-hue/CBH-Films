const {chromium} = require('playwright');
const pages = {
  before: '/dev/shm/before.html',
  single: '/home/user/CBH-Films/out/itineraries/lake-district-itinerary-page-mockup.html',
  site: '/home/user/CBH-Films/out/itineraries/lake-district-itinerary-site/index.html',
};
(async () => {
  const b = await chromium.launch();
  for (const width of [1400, 390]) {
    for (const [name, path] of Object.entries(pages)) {
      const p = await b.newPage({viewport: {width, height: 900}});
      await p.goto('file://' + path, {waitUntil: 'load'});
      await p.addStyleTag({content: 'header{position:static!important}'});
      await p.waitForTimeout(300);
      await p.screenshot({path: `/dev/shm/cmp-${name}-${width}.png`, fullPage: true});
      await p.close();
    }
  }
  await b.close();
})();
