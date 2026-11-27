#!/usr/bin/env python3
"""The Revanista devices image for the GN Revenue Management video: cut from the cover of GN's own Revanista carousel
(the real rate screens on a laptop, a monitor and a phone), with the carousel's red decorations taken out cleanly
(Scott: "clean the smudges").
  - the big decorations (half circle, outlined boxes, dot grid) sit on plain studio grey left of and above the laptop:
    those boxes take a smooth surface fitted to the grey round them (inpainting left blotches)
  - the line ends touching the laptop's bezel take the grey 16 to their left, only where red, so the bezel keeps its edge
  - the four dots by the monitor's pale disc take the plain pixels 40 above them (the dots are 16 apart)
Usage: python3 scripts/revanista-devices-clean.py <carousel cover jpg> (writes public/campaigns/gn-revenue/revanista-devices.jpg)
"""
import sys

import cv2
import numpy as np

im = cv2.imread(sys.argv[1]).astype(np.float32)
h, w = im.shape[:2]
b, g, r = [im[..., i] for i in range(3)]
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)


def is_red(img):
    b, g, r = [img[..., i] for i in range(3)]
    return ((r - (g + b) / 2) > 8) & (r > g + 5)


# a smooth surface fitted to the plain grey round the decorations
region = np.zeros((h, w), bool)
region[760:1120, 35:200] = True
region[760:912, 200:350] = True
sample = region & ~(cv2.dilate(is_red(im).astype(np.uint8), np.ones((11, 11), np.uint8)) > 0)


def basis(X, Y):
    return np.stack([np.ones_like(X), X, Y, X * X, X * Y, Y * Y, X**3, Y**3, X * X * Y, X * Y * Y], -1)


A, Aa = basis(xx[sample] / w, yy[sample] / h), basis(xx / w, yy / h)
fit = np.zeros_like(im)
for c in range(3):
    coef, *_ = np.linalg.lstsq(A, im[..., c][sample], rcond=None)
    fit[..., c] = Aa @ coef

# the big decorations: their boxes take the fitted grey, feathered
boxes = np.zeros((h, w), np.float32)
for y0, y1, x0, x1 in [(795, 1080, 80, 206), (805, 914, 175, 345)]:
    boxes[y0:y1, x0:x1] = 1
boxes = cv2.GaussianBlur(boxes, (0, 0), 2)[..., None]
out = im * (1 - boxes) + fit * boxes
left = is_red(out).astype(np.uint8)

# the line ends against the laptop's bezel
# (boxes kept left of the laptop's screen: its amber row reads as red; a lower threshold for the faint pink ends)
ob, og, orr = [out[..., i] for i in range(3)]
faint = (((orr - (og + ob) / 2) > 3) & (orr > og + 2)).astype(np.uint8)
lines = np.zeros((h, w), np.uint8)
for y0, y1, x0, x1 in [(920, 956, 196, 221), (984, 1016, 196, 213)]:
    lines[y0:y1, x0:x1] = 1
m = cv2.dilate(faint & lines, np.ones((3, 3), np.uint8), iterations=1).astype(bool) & (lines > 0)
ys, xs = np.where(m)
out[ys, xs] = out[ys, xs - 16]  # the grey just left of them, its shading matched

# the dots by the monitor's disc
dots = np.zeros((h, w), np.uint8)
dots[880:944, 392:436] = 1
m = cv2.dilate(left & dots, np.ones((3, 3), np.uint8), iterations=2).astype(bool)
ys, xs = np.where(m)
out[ys, xs] = out[ys - 40, xs]

crop = np.clip(out, 0, 255).astype(np.uint8)[735:1215, 30:905]
cv2.imwrite("public/campaigns/gn-revenue/revanista-devices.jpg", crop, [cv2.IMWRITE_JPEG_QUALITY, 94])
print("written", crop.shape)

# ------------------------------------------------------------------ full bleed plates (Scott: "I don't like the box thrown
# on top look, make it full bleed?"): the whole cover as a clean studio scene, its carousel text and the corner logo
# taken out, the devices at the bottom, at the cover's own resolution
plate = np.clip(out, 0, 255).astype(np.uint8).astype(np.float32)
# above the devices (y < 742) the cover is only its carousel text on a plain white to grey fade: that area is rebuilt as
# the fade itself (each row the colour of the cover's own clear right hand margin), crossfading into the photo just
# above the monitor so no seam shows (filling the letters one by one left their ghosts)
rowcol = np.median(plate[:760, 1012:1078], axis=1)
k = np.clip((np.arange(760) - 716) / 26, 0, 1)[:, None, None]  # 0 = the rebuilt fade, 1 = the photo
plate[:760] = rowcol[:, None, :] * (1 - k) + plate[:760] * k
# the Revanista logo in the bottom right corner, on the studio floor
logo = np.zeros((h, w), np.uint8)
logo[1238:1285, 862:1052] = 255
plate8 = cv2.inpaint(np.clip(plate, 0, 255).astype(np.uint8), logo, 7, cv2.INPAINT_TELEA)
pf = plate8.astype(np.float32)
pb = cv2.GaussianBlur(pf, (0, 0), 6)
lm = cv2.GaussianBlur(logo.astype(np.float32) / 255, (0, 0), 3)[..., None]
plate8 = np.clip(pf * (1 - lm) + pb * lm, 0, 255).astype(np.uint8)
cv2.imwrite("public/campaigns/gn-revenue/revanista-plate-tall.jpg", plate8, [cv2.IMWRITE_JPEG_QUALITY, 94])

# 16:9: the cover's lower 1080 rows on the right, the studio carried on to the left from its own left edge column
rows = plate8[270:1350]
edge = np.median(rows[:, 4:14].astype(np.float32), axis=1)  # the plain studio at the cover's left edge, row by row
wide = np.repeat(edge[:, None, :], 1920, axis=1)
wide[:, 840:] = rows
feather = np.clip((np.arange(1920) - 840) / 60, 0, 1)[None, :, None]
wide[:, 840:900] = (edge[:, None, :] * (1 - feather[:, 840:900]) + rows[:, :60].astype(np.float32) * feather[:, 840:900])
cv2.imwrite("public/campaigns/gn-revenue/revanista-plate-wide.jpg", np.clip(wide, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 94])
print("plates written")
