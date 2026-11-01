#!/usr/bin/env python3
"""A hand-made depth map for Waterton Park's afternoon tea (white near): MiDaS read the cake
stand's top as far and its base as near, so on the glide the legs bent where the table slid
under them (Scott: "it stretches a bit and gets nauseating"). Here the room is far, the two
chairs near, the table slopes toward the camera, and every object (stand with its food,
glasses, teapot, cups) is one solid layer at the depth of the spot it stands on."""
import numpy as np
from PIL import Image, ImageDraw

W, H = 1920, 1280
d = np.zeros((H, W), np.float32)
# the table: from its far edge (y 1040) to the bottom of the frame
table = lambda y: 0.55 + np.clip((y - 1040) / 240, 0, 1) * 0.4
yy = np.arange(H)[:, None] * np.ones((1, W))
d = np.where(yy >= 1060, table(yy), d)
img = Image.fromarray((d * 255).astype(np.uint8))
dr = ImageDraw.Draw(img)
v = lambda y: int(table(y) * 255)  # an object's depth: where it stands on the table
# chairs either side, in front of the table's far edge
dr.polygon([(0, 760), (240, 770), (470, 860), (500, 1100), (300, 1180), (0, 1280)], fill=200)
dr.polygon([(1490, 720), (1700, 700), (1920, 760), (1920, 1280), (1700, 1180), (1500, 1060)], fill=200)
# the cake stand is not in the map: it moves as its own rigid layer (make-tea-stand-mask.py,
# --layer-near 0.81, the depth of its feet); drawn in here, the thin arch took some of the
# room's depth and stretched (Scott: "it's warped in the stand on top")
# glasses, teapot, cups and saucers
dr.rectangle((520, 795, 750, 1232), fill=v(1230))
dr.rectangle((1230, 860, 1445, 1125), fill=v(1120))
dr.rectangle((295, 1030, 585, 1172), fill=v(1160))
dr.rectangle((1380, 1025, 1690, 1182), fill=v(1170))
img.save(__file__.replace("make-tea-depth.py", "afternoon-tea-depth.png"))
