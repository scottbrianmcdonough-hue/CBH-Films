"""Teenage Psycho front cover at any Lulu trim size: the pink notebook page and Lily's drawing (art.png)."""
import sys
from PIL import Image
tw, th = float(sys.argv[1]), float(sys.argv[2])  # trim, inches
DPI, BLEED, SAFE = 300, 0.125, 0.25
W, H = round((tw + 2 * BLEED) * DPI), round((th + 2 * BLEED) * DPI)
edge = round((BLEED + SAFE) * DPI)  # keep her drawing inside this
aw0, ah0 = Image.open("art.png").size
aw = W - 2 * edge - 20
ah = round(aw * ah0 / aw0)
ax = (W - aw) // 2 + 10
ay = round(H * 0.5 - ah / 2)
step = round(H / 25)
lines = "".join(f'<line x1="0" x2="{W}" y1="{y}" y2="{y}" />' for y in range(round(H * 0.11), H, step))
hs = round(step * 1.27)
holes = "".join(f'<rect x="{round(W*0.04)}" y="{y}" width="{round(W*0.035)}" height="{round(step*0.42)}" rx="9" />' for y in range(round(H * 0.05), H - 40, hs))
mx = round(W * 0.16)
sx = [ax + aw * 0.28, ax + aw * 0.52, ax + aw * 0.76]
sy = ay - round(H * 0.035)
sparks = (f'<line x1="{sx[0]-18:.0f}" y1="{sy-60}" x2="{sx[0]+18:.0f}" y2="{sy}" />'
          f'<line x1="{sx[1]:.0f}" y1="{sy-80}" x2="{sx[1]:.0f}" y2="{sy-8}" />'
          f'<line x1="{sx[2]+18:.0f}" y1="{sy-60}" x2="{sx[2]-18:.0f}" y2="{sy}" />')
html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
html,body{{margin:0;padding:0}} body{{width:{W}px;height:{H}px;overflow:hidden;background:#e3e9ef}} svg{{display:block}}
</style></head><body>
<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">
<defs>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" /><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.35  0 0 0 0 0.45  0 0 0 0.08 0" /></filter>
<filter id="ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="7" /><feDisplacementMap in="SourceGraphic" scale="6" /></filter>
<radialGradient id="vig" cx="50%" cy="45%" r="75%"><stop offset="60%" stop-color="#000" stop-opacity="0" /><stop offset="100%" stop-color="#2c3e55" stop-opacity="0.22" /></radialGradient>
</defs>
<rect width="{W}" height="{H}" fill="#e3e9ef" /><rect width="{W}" height="{H}" filter="url(#grain)" />
<g stroke="#9fb3c8" stroke-width="4" opacity="0.75">{lines}</g>
<line x1="{mx}" x2="{mx}" y1="0" y2="{H}" stroke="#ffd83d" stroke-width="6" opacity="0.9" />
<g fill="#aab6c2">{holes}</g>

<image href="art.png" x="{ax}" y="{ay}" width="{aw}" height="{ah}" />
</svg></body></html>'''
open("paper-front.html", "w").write(html)
print(W, H, "art", aw, ah, "at", ax, ay)
