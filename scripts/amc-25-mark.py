#!/usr/bin/env python3
"""Measurements of CBH's 25 Years / Empowering Independents lockup for the AMC reel's ending
(Scott: "bonus points if you can get it like the lock up ... at the end", then "just use the real
file": public/brand/cbh-25-years-lockup.png, 607 x 250, which the film shows as it is). The film
builds it in two parts, so this traces the diamond's outline from the file to a vector path
(potrace, `pip install potracer`) to clip the picture by, and measures the bar and the gold 25
(where the film's own 25 settles). Writes src/hotel-film/amc/mark25.ts in the file's pixel units.
Usage: python3 scripts/amc-25-mark.py [LOCKUP_PNG]
"""
import sys

import numpy as np
import potrace
from PIL import Image, ImageFilter
from scipy import ndimage

SRC = sys.argv[1] if len(sys.argv) > 1 else "public/brand/cbh-25-years-lockup.png"
# Scott's zoomed screenshot of the same lockup: its gold 25 is ~500px wide, about the size the end
# card shows it at, so the big 25 and YEARS the count lands on are traced from it
BIG = sys.argv[2] if len(sys.argv) > 2 else "public/brand/cbh-25-years-zoom.jpg"
BIG_CROP = (300, 600, 950, 1750)  # round the gold mark, clear of the phone's status bar
UP = 8

a = np.asarray(Image.open(SRC).convert("RGBA")).astype(float)
R, G, B, A = a[..., 0], a[..., 1], a[..., 2], a[..., 3] / 255
L = (R + G + B) / 3
h, w = L.shape
yy, xx = np.mgrid[0:h, 0:w]

# how gold a pixel is: warm (red well over blue) and bright enough, against the dark ink
gold = np.clip(((R - B) - 25) / 55, 0, 1) * np.clip((R - 70) / 60, 0, 1) * A
# the ink: opaque and dark, or gold (so the diamond comes out solid)
ink = np.clip((200 - L) / 120, 0, 1) * A
ink = np.maximum(ink, gold)


def up(m):
    """enlarge a 0..1 mask UP times, smoothly, and threshold it to a bitmap"""
    im = Image.fromarray((m * 255).astype(np.uint8))
    im = im.resize((w * UP, h * UP), Image.LANCZOS).filter(ImageFilter.GaussianBlur(UP * 0.45))
    return np.asarray(im) > 127


def trace(bits, turd=4):
    path = potrace.Bitmap(~bits).trace(  # potracer fills the False pixels
        turdsize=turd * UP * UP, alphamax=0.9, opticurve=True, opttolerance=0.25
    )

    def pt(p):
        return f"{p.x / UP:.2f} {p.y / UP:.2f}"

    d = []
    for curve in path:
        d.append(f"M{pt(curve.start_point)}")
        for s in curve.segments:
            if s.is_corner:
                d.append(f"L{pt(s.c)}L{pt(s.end_point)}")
            else:
                d.append(f"C{pt(s.c1)} {pt(s.c2)} {pt(s.end_point)}")
        d.append("Z")
    return "".join(d)


# the diamond is the ink connected to its centre (the gap line parts it from the bar)
inkb = ink > 0.5
lab, _ = ndimage.label(inkb)
diamond = ndimage.binary_fill_holes(lab == lab[h // 2, 125]).astype(float)
ys, xs = np.nonzero(diamond)
# the bar: the ink right of the diamond, a plain rectangle
bar = (lab == lab[h // 2, w - 8])
bys, bxs = np.nonzero(bar)

goldb = up(gold)
gys, gxs = np.nonzero(goldb)
g25 = goldb.copy()
rows = np.nonzero(goldb.any(1))[0]
gapr = rows[np.argmax(np.diff(rows))]  # the space between the 25 and YEARS
g25[gapr + 1 :] = False
ys25, xs25 = np.nonzero(g25)

# the big mark: the zoom's gold, traced at 2x, mapped onto the file's units by matching the gold's
# bounds in the two (so it lands exactly on the file's own 25 as it shrinks)
z = np.asarray(Image.open(BIG).convert("RGB").crop(BIG_CROP)).astype(float)
zg = np.clip(((z[..., 0] - z[..., 2]) - 25) / 55, 0, 1) * np.clip((z[..., 0] - 70) / 60, 0, 1)
ZUP = 2
zim = Image.fromarray((zg * 255).astype(np.uint8))
zim = zim.filter(ImageFilter.MedianFilter(5)).resize((zim.width * ZUP, zim.height * ZUP), Image.LANCZOS).filter(ImageFilter.GaussianBlur(3.0))
zb = np.asarray(zim) > 127
zys, zxs = np.nonzero(zb)
k = ((gxs.max() - gxs.min()) / UP) / ((zxs.max() - zxs.min()) / ZUP)  # zoom px to file units
zrows = np.nonzero(zb.any(1))[0]
zgap = zrows[np.argmax(np.diff(zrows))]


def trace_big(bits):
    path = potrace.Bitmap(~bits).trace(turdsize=40, alphamax=1.0, opticurve=True, opttolerance=0.8)

    def pt(p):
        x = gxs.min() / UP + (p.x - zxs.min()) / ZUP * k
        y = gys.min() / UP + (p.y - zys.min()) / ZUP * k
        return f"{x:.3f} {y:.3f}"

    d = []
    for curve in path:
        d.append(f"M{pt(curve.start_point)}")
        for s in curve.segments:
            if s.is_corner:
                d.append(f"L{pt(s.c)}L{pt(s.end_point)}")
            else:
                d.append(f"C{pt(s.c1)} {pt(s.c2)} {pt(s.end_point)}")
        d.append("Z")
    return "".join(d)


z25 = zb.copy()
z25[zgap + 1 :] = False
zyears = zb.copy()
zyears[: zgap + 1] = False

out = [
    "// CBH's 25 Years lockup traced by scripts/amc-25-mark.py from public/brand/cbh-25-years-lockup.png",
    "// (its pixel units; do not edit)",
    f'export const DIAMOND = "{trace(up(diamond))}";',
    "// the gold 25 and YEARS, traced large from the zoomed screenshot, in the same units",
    f'export const BIG25 = "{trace_big(z25)}";',
    f'export const BIGYEARS = "{trace_big(zyears)}";',
    f"export const LOCKUP = {{ width: {w}, height: {h}, centre: {{ x: {(xs.min() + xs.max() + 1) / 2}, y: {(ys.min() + ys.max() + 1) / 2} }},",
    f"  bar: {{ x0: {(xs.min() + xs.max() + 1) / 2}, x1: {bxs.max() + 1}, y0: {bys.min()}, y1: {bys.max() + 1} }},",
    f"  // the 25 alone (not YEARS): its centre and height, where the film's own 25 settles",
    f"  mark: {{ x: {(xs25.min() + xs25.max()) / 2 / UP:.1f}, y: {(ys25.min() + ys25.max()) / 2 / UP:.1f}, h: {(ys25.max() - ys25.min()) / UP:.1f} }},",
    f"  gold: {{ y0: {gys.min() / UP:.1f}, y1: {gys.max() / UP:.1f} }} }};",
]
with open("src/hotel-film/amc/mark25.ts", "w") as f:
    f.write("\n".join(out) + "\n")
print("\n".join(o[:160] for o in out[5:]))
