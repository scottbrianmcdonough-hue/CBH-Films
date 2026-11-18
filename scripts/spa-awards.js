// Good Spa Guide Awards 2026 winners, the LinkedIn collage (Scott, 18 Nov: "a better collage"), 1920x1080.
// Final (18 Nov): Low Wood Bay's infinity-pool-005 (the couple facing each other, warm, at 58% 50%) beside Gisborough's
// spa-treatment-room-001 (50% 60%): the two warm shots sit together; the shot from behind lost the couple's heads under
// the label, and the head spa and massage shots crop awkwardly.
// node scripts/spa-awards.js <out.jpg> <left photo> <left pos> <right photo> <right pos>   (photos relative to public/)
// House look: black, full bleed photos, no frame; the title across the top (gold caps with its underline, then cream
// Cormorant); each winner's label in the house order (gold caps place, underline, cream Cormorant name) with the award
// as the largest line, in cream italic; the white CB bottom right.
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const P = (f) => 'file://' + path.join(ROOT, 'public', f);
const [out, lp, lpos, rp, rpos] = process.argv.slice(2);
const W = [
  { photo: lp, pos: lpos || '50% 50%', place: 'Windermere, Lake District', name: 'Low Wood Bay Resort & Spa', award: 'Best Resort Spa' },
  { photo: rp, pos: rpos || '50% 50%', place: 'North Yorkshire', name: 'Gisborough Hall', award: 'Best New Spa' },
];
const tile = (w, i) => `<div class="t" style="left:${i ? 976 : 0}px">
  ${w.photo ? `<img src="${P(w.photo)}" style="object-position:${w.pos}">` : '<div class="ph">Photo to come</div>'}
  <div class="sh"></div>
  <div class="lab"><div class="cw"><div class="caps">${w.place}</div><div class="rule"></div></div>
  <div class="name">${w.name}</div><div class="award">${w.award}</div></div></div>`;
const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Corm;src:url(${P('fonts/CormorantGaramond.woff2')})}
@font-face{font-family:CormI;src:url(${P('fonts/CormorantGaramond-Italic.woff2')})}
@font-face{font-family:Sans;src:url(${P('fonts/OpenSans.woff2')})}
*{margin:0;box-sizing:border-box}body{width:1920px;height:1080px;background:#000;position:relative;overflow:hidden}
.top{position:absolute;left:72px;top:58px;color:#f2f0f0}
.caps{display:inline-block;font-family:Sans;font-weight:600;letter-spacing:.3em;color:#c7ab77;text-transform:uppercase;font-size:22px}
.rule{height:2px;background:#c7ab77;margin:10px 0 0}
.title{font-family:Corm;font-size:76px;line-height:1;margin-top:14px}
.t{position:absolute;top:224px;width:944px;height:856px;overflow:hidden;background:#111}
.t img{width:100%;height:100%;object-fit:cover}
.ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#555;font-family:Sans;font-size:28px;border:2px dashed #333}
.sh{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.82) 0%,rgba(0,0,0,.55) 24%,rgba(0,0,0,0) 48%)}
.lab{position:absolute;left:56px;bottom:54px;color:#f2f0f0}
.cw{display:inline-block}.lab .caps{font-size:19px}
.name{font-family:Corm;font-size:50px;line-height:1.05;margin-top:14px;text-shadow:0 2px 14px rgba(0,0,0,.5)}
.award{font-family:CormI;font-size:76px;line-height:1;margin-top:6px;text-shadow:0 2px 14px rgba(0,0,0,.5)}
.cb{position:absolute;right:56px;top:66px;width:76px;opacity:.9}
</style>
<div class="top"><div class="cw"><div class="caps">Good Spa Guide Awards 2026</div><div class="rule"></div></div><div class="title">Our winners</div></div>
<img class="cb" src="${P('brand/cb-watermark.png')}">
${W.map(tile).join('')}`;
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const f = path.join(path.dirname(path.resolve(out)), '_spa.html'); fs.writeFileSync(f, html);
  await pg.goto('file://' + f, { waitUntil: 'load' }); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(200);
  await pg.screenshot({ path: path.resolve(out), type: 'jpeg', quality: 93 }); fs.unlinkSync(f); await b.close();
})();
