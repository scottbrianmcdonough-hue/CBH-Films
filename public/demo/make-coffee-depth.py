#!/usr/bin/env python3
"""A hand-made depth map for the coffee photo (white near): MiDaS small can't separate the
cup from the sill, so the cup and saucer are drawn as one solid layer standing on the sill,
the sill rising towards the camera, the window frame in the middle and the street outside far.
Drawn on the photo at 1126x2000 (its display size) and scaled up. Usage: make-coffee-depth.py"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

DIR = __file__.rsplit("/", 1)[0]
w, h = 1126, 2000
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
# the glass ends along a line from (220, 1080) to (1126, 1590); the frame's bottom rail lies
# below it (40px deep on the left, 120 on the right), then the sill
line_y = 1080 + (xx - 220) * (510 / 906)
rail = 40 + 80 * xx / w
sill = np.clip(0.5 + 0.5 * (yy - line_y - rail) / 800, 0.5, 1.0)
d = np.where(yy > line_y + rail, sill, 0.08)  # the street outside, far
frame = ((yy > line_y) & (yy <= line_y + rail)) | ((xx < 220) & (yy <= line_y + rail))
d = np.where(frame, 0.42, d)
img = Image.fromarray((d * 255).astype(np.uint8))
img = img.filter(ImageFilter.GaussianBlur(6))
# the cup and saucer: one layer, as near as the sill where it stands
draw = ImageDraw.Draw(img)
v = int(0.8 * 255)
draw.ellipse((225, 1580, 775, 1705), fill=v)  # saucer
draw.rectangle((335, 1395, 668, 1640), fill=v)  # cup body
draw.ellipse((335, 1355, 668, 1435), fill=v)  # cup rim
draw.ellipse((600, 1460, 735, 1600), fill=v)  # handle
img = img.filter(ImageFilter.GaussianBlur(4))
img.resize((3225, 5730), Image.BICUBIC).save(f"{DIR}/coffee-depth.png")
print("coffee-depth.png")
