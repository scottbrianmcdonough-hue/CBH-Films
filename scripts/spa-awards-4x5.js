// Good Spa Guide Awards 2026, the 4:5 of the roundel collage Scott picked (18 Nov): the two spa shots across the top with
// their labels (award in gold caps, the full name in cream Cormorant, the place in white caps), the four scenes along the
// bottom, the dark roundel (CB, GOOD SPA GUIDE / AWARDS 2026, Winners) over the middle of that row. 1080x1350.
// node scripts/spa-awards-4x5.js <out.jpg>
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const P = (f) => 'file://' + path.join(ROOT, 'public', f);
const out = path.resolve(process.argv[2]);
const M = 20, G = 10, W = 1080, H = 1350, TOP = 720;
const bw = (W - 2 * M - G) / 2, sw = (W - 2 * M - 3 * G) / 4, sy = M + TOP + G, sh = H - M - sy;
const big = [
  { x: M, src: 'campaigns/spa-awards/low-wood-bay-infinity-pool-005.jpg', pos: '38% 50%', award: 'Best Resort Spa', name: 'Low Wood Bay<br>Resort & Spa', place: 'Windermere, Lake District' },
  { x: M + bw + G, src: 'campaigns/spa-awards/gisborough-head-spa-treatment-001.jpg', pos: '45% 32%', award: 'Best New Spa', name: 'Gisborough Hall<br>Country House<br>Hotel & Spa', place: 'North Yorkshire' },
];
const small = [
  ['campaigns/camera-roll/posters/low-wood-bay-misty-lake.jpg', '50% 50%'],
  ['campaigns/camera-roll/posters/low-wood-bay-candles.jpg', '50% 92%'],
  ['campaigns/autumn-leaves-reel/gisborough-ivy.jpg', '50% 40%'],
  ['campaigns/camera-roll/posters/gisborough-hall-misty-sunrise.jpg', '50% 50%'],
];
const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Corm;src:url(${P('fonts/CormorantGaramond.woff2')})}
@font-face{font-family:CormI;src:url(${P('fonts/CormorantGaramond-Italic.woff2')})}
@font-face{font-family:Sans;src:url(${P('fonts/OpenSans.woff2')})}
*{margin:0;box-sizing:border-box}body{width:${W}px;height:${H}px;background:#282825;position:relative;overflow:hidden}
.t{position:absolute;overflow:hidden}.t img{width:100%;height:100%;object-fit:cover}
.sh{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.85) 0%,rgba(0,0,0,.55) 30%,rgba(0,0,0,0) 55%)}
.lab{position:absolute;left:34px;bottom:34px;right:20px;color:#f2f0f0}
.aw{font-family:Sans;font-weight:600;letter-spacing:.24em;font-size:19px;color:#c7ab77;text-transform:uppercase}
.nm{font-family:Corm;font-size:44px;line-height:1.06;margin-top:12px;text-shadow:0 2px 12px rgba(0,0,0,.5)}
.pl{font-family:Sans;font-weight:600;letter-spacing:.2em;font-size:14px;margin-top:12px;text-transform:uppercase}
.rd{position:absolute;left:${W / 2 - 160}px;top:${sy + sh / 2 - 160}px;width:320px;height:320px;border-radius:50%;background:#282825;
  box-shadow:0 0 0 6px #282825,0 10px 40px rgba(0,0,0,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#f2f0f0}
.rd:after{content:"";position:absolute;inset:12px;border-radius:50%;border:1.5px solid #c7ab77}
.rd img{width:56px;margin-bottom:16px}
.rc{font-family:Sans;font-weight:600;letter-spacing:.24em;font-size:15px;text-transform:uppercase;color:#c7ab77;text-align:center;line-height:1.8}
.rw{font-family:CormI;font-size:64px;line-height:1;margin-top:10px}
</style>
${big.map(b => `<div class="t" style="left:${b.x}px;top:${M}px;width:${bw}px;height:${TOP}px"><img src="${P(b.src)}" style="object-position:${b.pos}"><div class="sh"></div>
<div class="lab"><div class="aw">${b.award}</div><div class="nm">${b.name}</div><div class="pl">${b.place}</div></div></div>`).join('')}
${small.map(([src, pos], i) => `<div class="t" style="left:${M + i * (sw + G)}px;top:${sy}px;width:${sw}px;height:${sh}px"><img src="${P(src)}" style="object-position:${pos}"></div>`).join('')}
<div class="rd"><img src="${P('brand/cb-watermark.png')}"><div class="rc">Good Spa Guide<br>Awards 2026</div><div class="rw">Winners</div></div>`;
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: W, height: H } });
  const f = path.join(path.dirname(out), '_spa45.html'); fs.writeFileSync(f, html);
  await pg.goto('file://' + f, { waitUntil: 'load' }); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(200);
  await pg.screenshot({ path: out, type: 'jpeg', quality: 93 }); fs.unlinkSync(f); await b.close();
})();
