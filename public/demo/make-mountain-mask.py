#!/usr/bin/env python3
"""The near hillside of the mountain photo cut out (white = the grass slope, the rock outcrop
and the walker on it), so the depth move carries it over the lake without bending the
water at the rock's edge (Scott: "watch the warping"). GrabCut seeded from where things
plainly are: the meadow at the bottom and the rock are near; the lake (dark blue water) and
everything above it are far. Usage: make-mountain-mask.py"""
import cv2
import numpy as np
from PIL import Image, ImageDraw

DIR = __file__.rsplit("/", 1)[0]
src = cv2.imread(f"{DIR}/mountain.jpg")
H, W = src.shape[:2]
q = 4
img = cv2.resize(src, (W // q, H // q), interpolation=cv2.INTER_AREA)
h, w = img.shape[:2]
s = w / 1333  # seeds drawn on the photo at 1333 px wide


def poly(points):
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).polygon([(x * s, y * s) for x, y in points], fill=255)
    return np.asarray(m) > 0


yy = np.mgrid[0:h, 0:w][0] / s
b, g, r = [img[..., i].astype(np.int16) for i in range(3)]
water = (b - r > 8) & (b < 110) & (yy > 1020) & (yy < 1360)
mask = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
mask[yy < 990] = cv2.GC_BGD  # the mountains and the sky
# the rock face is in blue shadow too: no water seeds inside the outcrop's outline
rockzone = poly([(0, 1100), (640, 1140), (676, 1146), (775, 1300), (830, 1410), (0, 1500)])
mask[water & ~rockzone] = cv2.GC_BGD
mask[rockzone] = cv2.GC_PR_FGD
rock = poly([(0, 1180), (420, 1190), (600, 1190), (760, 1330), (860, 1460), (0, 1460)])
mask[rock] = cv2.GC_FGD
mask[yy > 1560] = cv2.GC_FGD  # the meadow at the bottom
mask[(b > 200) & (g > 200) & (r > 200) & (yy > 1300)] = cv2.GC_FGD  # the snow patches on the grass
mask[poly([(620, 1160), (670, 1165), (760, 1300), (795, 1380), (740, 1380), (640, 1250)])] = cv2.GC_FGD  # the cliff face
mask[poly([(0, 1080), (600, 1150), (600, 1190), (0, 1190)])] = cv2.GC_PR_FGD  # the grass up to the edge
walker = poly([(632, 1045), (668, 1045), (668, 1145), (632, 1145)])
mask[walker] = cv2.GC_PR_FGD
mask[poly([(642, 1060), (658, 1060), (658, 1130), (642, 1130)])] = cv2.GC_FGD
bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
cv2.grabCut(img, mask, None, bgd, fgd, 8, cv2.GC_INIT_WITH_MASK)
fg = np.isin(mask, [cv2.GC_FGD, cv2.GC_PR_FGD]).astype(np.uint8) * 255
n, lab, stats, _ = cv2.connectedComponentsWithStats(fg)
keep = 1 + np.argsort(stats[1:, cv2.CC_STAT_AREA])[::-1]
fg = np.isin(lab, keep[:1]).astype(np.uint8) * 255
# the walker may come out as its own piece: keep any piece in the walker's box
for i in range(1, n):
    if (lab == i)[walker].any():
        fg[lab == i] = 255
fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
fg = cv2.resize(fg, (W, H), interpolation=cv2.INTER_LINEAR)
# the walker traced by eye down to his boots and onto the rock (GrabCut lost his legs against the
# dark water, so they stayed on the lake as the cliff moved: Scott, "his feet get into the blue",
# "he needs to be standing on the thing like real"); drawn on a 600 px crop of x 540-780,
# y 980-1220 at 1333 wide
body = [(262, 165), (276, 170), (286, 186), (298, 186), (306, 192), (314, 214), (314, 240), (300, 250),
        (298, 290), (310, 330), (316, 360), (306, 402), (312, 416), (250, 416), (256, 370), (254, 320),
        (250, 296), (232, 292), (234, 250), (238, 196), (250, 178)]
S = W / 1333
m = Image.new("L", (W, H), 0)
ImageDraw.Draw(m).polygon([((540 + x * 0.4) * S, (980 + y * 0.4) * S) for x, y in body], fill=255)
fg = np.maximum(fg, np.asarray(m))
fg = cv2.GaussianBlur(fg, (0, 0), 1.5)
cv2.imwrite(f"{DIR}/mountain-near-mask.png", fg)
print("mountain-near-mask.png")
