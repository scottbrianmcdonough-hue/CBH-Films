#!/usr/bin/env python3
"""Hand-made depth maps for the Revanista studio plates (white near): the studio backdrop far, the floor coming forward,
the monitor in the middle, the laptop nearer, the phone nearest, each traced from the plate (the MiDaS read saw only the
floor, so the devices would have warped with it). Writes depth/plate-tall.png and depth/plate-wide.png.
Usage: python3 public/campaigns/gn-revenue/make-depth.py
"""
import os

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
os.makedirs(f"{HERE}/depth", exist_ok=True)

# traced on the tall plate (1080 x 1350)
MONITOR = [(437, 742), (890, 775), (862, 1142), (700, 1122), (437, 1088)]
STAND = [(600, 1105), (700, 1114), (692, 1150), (718, 1158), (720, 1176), (650, 1188), (556, 1181), (555, 1163), (612, 1150)]
LAPTOP = [(230, 915), (476, 950), (463, 1150), (446, 1180), (420, 1197), (300, 1247), (50, 1187), (43, 1167), (205, 1118)]
PHONE = [(470, 1062), (528, 1066), (531, 1200), (474, 1199)]


def depth(w, h, dx, dy):
    d = np.zeros((h, w), np.float32)
    # the floor comes forward towards the bottom of the frame
    yy = np.arange(h, dtype=np.float32)[:, None] - dy
    d[:] = np.clip((yy - 1080) / 270, 0, 1) * 0.25
    for poly, near in [(MONITOR, 0.45), (STAND, 0.45), (LAPTOP, 0.75), (PHONE, 0.9)]:
        pts = np.array([(x + dx, y + dy) for x, y in poly], np.int32)
        m = np.zeros((h, w), np.uint8)
        cv2.fillPoly(m, [pts], 255)
        d[m > 0] = near
    d = cv2.GaussianBlur(d, (0, 0), 2.5)
    return (np.clip(d, 0, 1) * 255).astype(np.uint8)


cv2.imwrite(f"{HERE}/depth/plate-tall.png", depth(1080, 1350, 0, 0))
cv2.imwrite(f"{HERE}/depth/plate-wide.png", depth(1920, 1080, 840, -270))  # the wide plate is the tall's rows 270 on, at x 840
print("depth maps written")
