"""Teenage Psycho back cover (5 x 8 in + bleed): the pink notebook page mirrored (holes on the spine side),
Lily's own lowercase title with its sparks, her blurb written on the ruled lines, her fingerprint, the
barcode corner left clear for Lulu."""
import sys
from PIL import Image
tw, th = float(sys.argv[1]), float(sys.argv[2])
DPI, BLEED, SAFE = 300, 0.125, 0.25
W, H = round((tw + 2 * BLEED) * DPI), round((th + 2 * BLEED) * DPI)
edge = round((BLEED + SAFE) * DPI)
step = round(H / 25)
first = round(H * 0.11)
lines = "".join(f'<line x1="0" x2="{W}" y1="{y}" y2="{y}" />' for y in range(first, H, step))
hs = round(step * 1.27)
hw = round(W * 0.035)
holes = "".join(f'<rect x="{W - round(W*0.04) - hw}" y="{y}" width="{hw}" height="{round(step*0.42)}" rx="9" />' for y in range(round(H * 0.05), H - 40, hs))
mx = W - round(W * 0.16)
tw0, th0 = Image.open("small-title-ink.png").size
tiw = 760; tih = round(tiw * th0 / tw0)
tix = (mx - tiw) // 2 + 20
tiy = first + step * 1 - 40
fw0, fh0 = Image.open("fingerprint.png").size
fpw = 150; fph = round(fpw * fh0 / fw0)
# the blurb sits on the ruled lines: line-height = the rule spacing, the first baseline on a rule
blurb_top = first + step * 5
import glob
k = step / (57 * 3)  # her rule spacing (57 source px, lifted at 3x) onto the cover's
lx = edge + 30
imgs = []
fs = sorted(glob.glob("blurb-line-*.png"), key=lambda f: int(f.split("-")[-1][:-4]))
for n, f in enumerate(fs):
    iw, ih = Image.open(f).size
    base = first + step * (6 + n)
    imgs.append(f'<img src="{f}" style="position:absolute;left:{lx}px;top:{base - round(210 * k)}px;width:{round(iw * k)}px;height:{round(ih * k)}px" />')
blurb_imgs = "\n".join(imgs)
sw0, sh0 = Image.open("stamp.png").size
sw = 270; sh = round(sw * sh0 / sw0)
last = first + step * (6 + len(fs) - 1)
stamp_img = f'<img src="stamp.png" style="position:absolute;left:{mx - sw - 50}px;top:{last + 40}px;width:{sw}px;height:{sh}px" />'
html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family: "Patrick"; src: url(patrick.woff2); }}
html,body{{margin:0;padding:0}} body{{width:{W}px;height:{H}px;overflow:hidden;background:#e3e9ef;position:relative}}
svg{{display:block;position:absolute;left:0;top:0}}
.blurb{{position:absolute;left:{edge + 40}px;width:{mx - edge - 100}px;top:{blurb_top - step + 18}px;font-family:"Patrick";font-size:76px;
line-height:{step}px;color:#161616;letter-spacing:0.5px}}
</style></head><body>
<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">
<defs>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" /><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.35  0 0 0 0 0.45  0 0 0 0.08 0" /></filter>
<radialGradient id="vig" cx="50%" cy="45%" r="75%"><stop offset="60%" stop-color="#000" stop-opacity="0" /><stop offset="100%" stop-color="#2c3e55" stop-opacity="0.22" /></radialGradient>
</defs>
<rect width="{W}" height="{H}" fill="#e3e9ef" /><rect width="{W}" height="{H}" filter="url(#grain)" />
<g stroke="#9fb3c8" stroke-width="4" opacity="0.75">{lines}</g>
<line x1="{mx}" x2="{mx}" y1="0" y2="{H}" stroke="#ffd83d" stroke-width="6" opacity="0.9" />
<g fill="#aab6c2">{holes}</g>

<image href="small-title-ink.png" x="{tix}" y="{tiy}" width="{tiw}" height="{tih}" />
</svg>
{blurb_imgs}
{stamp_img}
</body></html>'''
open("paper-back.html", "w").write(html)
print(W, H, "step", step)
