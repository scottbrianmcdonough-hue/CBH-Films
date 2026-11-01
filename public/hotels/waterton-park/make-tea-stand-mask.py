#!/usr/bin/env python3
"""The cake stand cut out of Waterton Park's afternoon tea (white = stand), so the depth move
carries it as one rigid layer: drawn into the depth map, the thin arch took some of the room's
depth and stretched as the camera glided (Scott: "it's warped in the stand on top"). The wire
arch and rods are found in the photo (the darkest pixel near where they were drawn by eye),
the plates and the food on them are drawn by hand.
Usage: make-tea-stand-mask.py (then make-tea-depth.py, which leaves the stand out)"""
import math
import cv2
import numpy as np
from PIL import Image, ImageDraw

DIR = __file__.rsplit("/", 1)[0]
src = cv2.imread(f"{DIR}/afternoon-tea.jpg")
H, W = src.shape[:2]
gray = cv2.GaussianBlur(cv2.cvtColor(src, cv2.COLOR_BGR2GRAY).astype(np.float32), (0, 0), 1.2)


def snap(x, y, nx, ny, reach=14):
    """The darkest pixel within reach of (x, y) along the normal (nx, ny): the wire."""
    best, bp = 1e9, (x, y)
    for t in range(-reach, reach + 1):
        px, py = int(round(x + nx * t)), int(round(y + ny * t))
        if 0 <= px < W and 0 <= py < H and gray[py, px] < best:
            best, bp = gray[py, px], (px, py)
    return bp


# the arch, by eye: a half ellipse over the stand, centre (1001, 560), radii (226, 230)
cx, cy, rx, ry = 1001, 560, 226, 230


def trace(cx, cy, rx, ry, reach):
    pts = []
    for a in np.linspace(math.pi, 2 * math.pi, 120):
        x, y = cx + rx * math.cos(a), cy + ry * math.sin(a)
        nx, ny = math.cos(a) / rx, math.sin(a) / ry
        n = math.hypot(nx, ny)
        pts.append(snap(x, y, nx / n, ny / n, reach))
    return np.array(pts, np.float32)


# the dark plant behind the right side pulls a wide search off the wire: fit an ellipse to
# what was found, dropping the strays, then search again close to it
arch = trace(cx, cy, rx, ry, 14)
keep = np.ones(len(arch), bool)
for _ in range(4):
    p = arch[keep]
    A = np.stack([p[:, 0] ** 2, p[:, 1] ** 2, p[:, 0], p[:, 1], np.ones(len(p))], 1)
    _, _, vt = np.linalg.svd(A)
    a_, b_, c_, d_, e_ = vt[-1]
    cx, cy = -c_ / (2 * a_), -d_ / (2 * b_)
    k = a_ * cx ** 2 + b_ * cy ** 2 - e_
    rx, ry = math.sqrt(k / a_), math.sqrt(k / b_)
    r = np.hypot((arch[:, 0] - cx) / rx, (arch[:, 1] - cy) / ry)
    keep = np.abs(r - 1) * min(rx, ry) < 4
arch = trace(cx, cy, rx, ry, 4)
print(f"arch ellipse: centre ({cx:.1f}, {cy:.1f}), radii ({rx:.1f}, {ry:.1f})")
# smooth the found wire (a single dark pixel can be a leaf)
arch = cv2.GaussianBlur(arch.reshape(-1, 1, 2), (1, 9), 0).reshape(-1, 2)
# the two side rods, from the arch's ends down to the feet
rods = []
for x0, y0, y1 in ((arch[0][0], arch[0][1], 1168), (arch[-1][0], arch[-1][1], 1130)):
    pts = [snap(x0, y, 1, 0, 8) for y in range(int(y0), y1, 6)]
    xs = np.array([p[0] for p in pts], np.float32)
    xs = cv2.GaussianBlur(xs.reshape(-1, 1), (1, 9), 0).ravel()
    rods.append(np.array([(x, y) for x, y in zip(xs, range(int(y0), y1, 6))], np.float32))

m = Image.new("L", (W, H), 0)
d = ImageDraw.Draw(m)
wire = 12
d.line([tuple(p) for p in arch], fill=255, width=wire, joint="curve")
for r in rods:
    d.line([tuple(p) for p in r], fill=255, width=wire, joint="curve")
# feet, the inner legs and the ring under the bottom plate
for e in [(768, 1155, 790, 1180), (1225, 1118, 1247, 1142), (1128, 1175, 1150, 1200)]:
    d.ellipse(e, fill=255)
d.line([(912, 1060), (910, 1122)], fill=255, width=wire)
d.line([(1125, 1060), (1140, 1190)], fill=255, width=wire)
d.line([(850, 1045), (1180, 1048)], fill=255, width=wire)
# the plates (with their rings) and the food on them
for box in [(778, 538, 1238, 608), (783, 772, 1242, 834), (779, 968, 1240, 1062)]:
    d.ellipse(box, fill=255)
d.polygon([(853, 548), (870, 520), (915, 505), (935, 482), (1000, 478), (1010, 500), (1060, 505), (1090, 505),
           (1100, 515), (1145, 532), (1150, 548)], fill=255)  # top tier: cakes and raspberries
d.polygon([(860, 795), (862, 760), (900, 728), (950, 710), (1000, 712), (1040, 705), (1110, 705), (1140, 735),
           (1150, 790)], fill=255)  # middle tier: scones and the ramekin
d.polygon([(855, 1020), (856, 955), (880, 920), (930, 900), (1000, 880), (1060, 880), (1120, 905), (1170, 925),
           (1200, 935), (1245, 955), (1245, 1015)], fill=255)  # bottom tier: sandwiches, wraps, tart
mask = cv2.GaussianBlur(np.asarray(m), (0, 0), 1.0)
cv2.imwrite(f"{DIR}/afternoon-tea-stand-mask.png", mask)
print("afternoon-tea-stand-mask.png; arch top at", arch[np.argmin(arch[:, 1])])
