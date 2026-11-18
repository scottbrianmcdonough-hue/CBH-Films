// Coombe Abbey socials intro: the 4:5 carousel and the 9:16 Story frames, drawn in a browser so the house fonts load.
// node scripts/coombe/social_frames.js <outdir>
const { chromium } = require('playwright');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const P = (f) => 'file://' + path.join(ROOT, 'public', f);
const out = path.resolve(process.argv[2]);
const css = `
@font-face{font-family:Corm;src:url(${P('fonts/CormorantGaramond.woff2')})}
@font-face{font-family:CormI;src:url(${P('fonts/CormorantGaramond-Italic.woff2')})}
@font-face{font-family:Sans;src:url(${P('fonts/OpenSans.woff2')})}
*{margin:0;box-sizing:border-box}body{background:#000}
.f{position:relative;overflow:hidden;background:#000}
.f img.ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.shade{position:absolute;inset:0;background:linear-gradient(to top,rgba(9,9,10,.85) 0%,rgba(9,9,10,.55) 26%,rgba(9,9,10,0) 50%)}
.lab{position:absolute;left:72px;color:#f2f0f0}
.line{font-family:CormI;font-size:58px;line-height:1.05;margin-bottom:26px;text-shadow:0 2px 18px rgba(9,9,10,.6)}
.caps{display:inline-block;font-family:Sans;font-weight:600;font-size:22px;letter-spacing:.3em;color:#c7ab77;text-transform:uppercase}
.rule{height:2px;background:#c7ab77;margin:10px 0 14px}
.name{font-family:Corm;font-size:68px;line-height:1.02;text-shadow:0 2px 18px rgba(9,9,10,.6)}
.cb{position:absolute;width:84px;opacity:.85}`;
const frame = (w, h, src, pos, label, labBottom, cbTop) => `<div class="f" style="width:${w}px;height:${h}px">
<img class="ph" src="${P('hotels/coombe-abbey/' + src)}" style="object-position:${pos}">
${label ? `<div class="shade"></div><div class="lab" style="bottom:${labBottom}px"><div class="line">New to the collection</div>
<div style="display:inline-block"><div class="caps">Coventry, Warwickshire</div><div class="rule"></div></div><div class="name">Coombe Abbey Hotel</div></div>` : ''}
<img class="cb" src="${P('brand/cb-watermark.png')}" style="left:${w - 84 - 56}px;top:${cbTop}px"></div>`;
// the new member carousel (Scott, 17 Nov, after Castle Inn and Atholl Palace): six full bleed slides, the white CB
// bottom right, no text: the aerial, The Princess Elizabeth's turret bathroom, The Lady Craven, dinner served,
// afternoon tea, the garden path to the lake
const jobs = [
  ['carousel-1', 1080, 1350, 'hotel-aerial-view-001.jpg', '50% 50%', false, 0, 1350 - 130],
  ['carousel-2', 1080, 1350, 'the-princess-elizabeth-grand-feature-bathroom-001.jpg', '62% 50%', false, 0, 1350 - 130],
  ['carousel-3', 1080, 1350, 'lady-craven-grand-feature-room-002.jpg', '50% 50%', false, 0, 1350 - 130],
  ['carousel-4', 1080, 1350, 'dining-001.jpg', '45% 50%', false, 0, 1350 - 130],
  ['carousel-5', 1080, 1350, 'afternoon-tea-001.jpg', '35% 50%', false, 0, 1350 - 130],
  ['carousel-6', 1080, 1350, 'gardens-001.jpg', '50% 50%', false, 0, 1350 - 130],
];
// LinkedIn intro (Scott, 17 Nov: "landscape for LinkedIn"): six 16:9 slides in the post's order, same look
if (process.argv[3] === 'linkedin') {
  jobs.length = 0;
  const L = (n, src, pos) => jobs.push(['linkedin-' + n, 1920, 1080, src, pos, false, 0, 1080 - 130]);
  L(1, 'hotel-aerial-view-001.jpg', '50% 50%');
  L(2, 'conference-room-cloisters-003.jpg', '50% 50%');  // the boardroom table down the centre to the stage (pick, 17 Nov)
  L(3, 'private-dining-marquee-001.jpg', '50% 50%');
  L(4, 'garden-room-restaurant-002.jpg', '50% 50%');
  L(5, 'lady-craven-grand-feature-room-wide.jpg', '50% 50%');  // The Lady Craven in place of the turret bathroom (Scott, 18 Nov)
  L(6, 'gardens-001.jpg', '50% 55%');
}
// one off 4:5 of The Lady Craven, the wide shot (Scott, 18 Nov)
if (process.argv[3] === 'lady-craven') { jobs.length = 0; jobs.push(['lady-craven-4x5', 1080, 1350, 'lady-craven-grand-feature-room-wide.jpg', process.argv[4] || '72% 50%', false, 0, 1350 - 130]); }
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage();
  for (const [name, w, h, src, pos, label, lb, cb] of jobs) {
    await pg.setViewportSize({ width: w, height: h });
    const file = path.join(out, '_frame.html');
    require('fs').writeFileSync(file, `<!doctype html><meta charset="utf-8"><style>${css}</style>${frame(w, h, src, pos, label, lb, cb)}`);
    await pg.goto('file://' + file, { waitUntil: 'load' });
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(150);
    await pg.screenshot({ path: path.join(out, name + '.jpg'), type: 'jpeg', quality: 92 });
  }
  await b.close();
})();
