#!/usr/bin/env python3
"""The cup and saucer cut out of the coffee photo (white = cup), so the depth move can carry
them as one solid layer over the sill instead of warping the window rail behind them
(Scott: "watch the warping"). GrabCut, seeded from the shapes in make-coffee-depth.py.
Usage: make-coffee-mask.py"""
import cv2
import numpy as np
from PIL import Image, ImageDraw

DIR = __file__.rsplit("/", 1)[0]
src = cv2.imread(f"{DIR}/coffee.jpg")
H, W = src.shape[:2]
k = 2  # work at half size
img = cv2.resize(src, (W // k, H // k), interpolation=cv2.INTER_AREA)
s = (W / 1126) / k  # the shapes were drawn at 1126 px wide
seed = Image.new("L", (img.shape[1], img.shape[0]), 0)
d = ImageDraw.Draw(seed)
for box, kind in [((205, 1545, 800, 1720), "e"), ((335, 1395, 668, 1640), "r"), ((335, 1355, 668, 1435), "e"),
                  ((600, 1460, 735, 1600), "e")]:
    b = [v * s for v in box]
    (d.ellipse if kind == "e" else d.rectangle)(b, fill=255)
seed = np.asarray(seed) > 0
mask = np.full(seed.shape, cv2.GC_BGD, np.uint8)
band = cv2.dilate(seed.astype(np.uint8), np.ones((121, 121), np.uint8)) > 0
mask[band] = cv2.GC_PR_BGD
mask[seed] = cv2.GC_PR_FGD
# the white china against the dark wood: bright pixels near the seed are cup
bright = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) > 150
saucer = Image.new("L", seed.shape[::-1], 0)
ImageDraw.Draw(saucer).ellipse([v * s for v in (195, 1540, 810, 1725)], fill=255)
mask[bright & (np.asarray(saucer) > 0)] = cv2.GC_FGD  # only the saucer (the rail is bright too)
mask[cv2.erode(seed.astype(np.uint8), np.ones((41, 41), np.uint8)) > 0] = cv2.GC_FGD
bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
ys, xs = np.where(band)
y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
sub = mask[y0:y1, x0:x1].copy()
cv2.grabCut(img[y0:y1, x0:x1], sub, None, bgd, fgd, 8, cv2.GC_INIT_WITH_MASK)
mask[y0:y1, x0:x1] = sub
fg = np.isin(mask, [cv2.GC_FGD, cv2.GC_PR_FGD]).astype(np.uint8) * 255
# keep the largest piece, close pinholes, a soft edge at full size
n, lab, stats, _ = cv2.connectedComponentsWithStats(fg)
fg = (lab == 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])).astype(np.uint8) * 255
fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
fg &= (cv2.dilate(seed.astype(np.uint8), np.ones((25, 25), np.uint8)) * 255)  # nothing far from the cup
# the rail's bright edge touches the rim on the right: nothing right of the rim above the handle
xx_, yy_ = np.meshgrid(np.arange(fg.shape[1]) / s, np.arange(fg.shape[0]) / s)
fg[(xx_ > 678) & (yy_ < 1458)] = 0
# and nothing above the rim's top arc (the rail again)
above = (yy_ < 1395) & (((xx_ - 501.5) / 169) ** 2 + ((yy_ - 1395) / 43) ** 2 > 1)
fg[above] = 0
fg = cv2.resize(fg, (W, H), interpolation=cv2.INTER_LINEAR)
# the rim's right end, traced by eye at full size: inside the rim's outer edge is cup, outside
# is the window rail (GrabCut took a ragged strip of rail there and lost the cup's edge, a tab
# that rode along with the cup: Scott, "fix the warp")
rim = [(1700, 3936), (1760, 3940), (1860, 3967), (1903, 3993), (1927, 4023), (1938, 4067), (1941, 4112)]
inside = Image.new("L", (W, H), 0)
ImageDraw.Draw(inside).polygon(rim + [(1700, 4112)], fill=255)
box = Image.new("L", (W, H), 0)
ImageDraw.Draw(box).rectangle((1700, 3870, 1995, 4112), fill=255)
inside, box = np.asarray(inside) > 0, np.asarray(box) > 0
fg[box & inside] = 255
fg[box & ~inside] = 0
fg = cv2.GaussianBlur(fg, (0, 0), 1.2)
cv2.imwrite(f"{DIR}/coffee-cup-mask.png", fg)
print("coffee-cup-mask.png")
