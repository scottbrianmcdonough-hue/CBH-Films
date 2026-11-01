#!/usr/bin/env python3
"""Hand-made depth for the autumn leaves Story's four stills (Scott, 1 Nov: "are there depth moves on the leaves
story": they were flat Ken Burns). White is near. Warp-free (the Haycock lesson): no softened object edges, only
flat planes and smooth ramps, and the one tall object (Hintlesham's bottle and glass) a rigid layer.
  gisborough: the house and sky one far plane, the shrubs and lawn coming forward (a ramp from the house's foot)
  hintlesham (overhead): the table and plate one plane, the bottle and glass a rigid near layer sliding over it
  wildboar: the soft background far, the plate and pudding a rigid layer, the blurred table front coming nearer
    (the ramp starts at the layer's own depth, so no seam opens at its foot)
  langshott: the wall, fire and stand one plane (the wire stand would bend on a ramp), the tablecloth coming forward
Writes depth/<name>.png (and -matte.png for the layers). Usage: python3 make-depth.py"""
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.dirname(os.path.dirname(HERE))


def ramp(name, src, flat, y0, y1, v1):
    w, h = Image.open(os.path.join(PUB, src)).size
    yy = np.arange(h, dtype=np.float32)[:, None]
    t = np.clip((yy - y0) / (y1 - y0), 0, 1)
    d = (flat + (v1 - flat) * t * t * (3 - 2 * t)) * np.ones((1, w), np.float32)
    Image.fromarray((d * 255).astype(np.uint8)).save(os.path.join(HERE, "depth", name + ".png"))


def matte(name, src, polys, soft=2):
    w, h = Image.open(os.path.join(PUB, src)).size
    m = Image.new("L", (w, h), 0)
    for p in polys:
        ImageDraw.Draw(m).polygon(p, fill=255)
    m.filter(ImageFilter.GaussianBlur(soft)).save(os.path.join(HERE, "depth", name + "-matte.png"))


GIS = "campaigns/autumn-leaves-reel/gisborough-ivy.jpg"
HIN = "hotels/hintlesham-hall/autumn-main.jpg"
WB = "campaigns/showcase/wild-boar.jpg"
LAN = "campaigns/autumn-leaves-reel/langshott-tea.jpg"

ramp("gisborough", GIS, 0.2, 1350, 1920, 0.85)
ramp("hintlesham", HIN, 0.2, 0, 1, 0.2)
# the bottle and the bowl of the glass (the glass's foot is on the cloth, so it stays with the table), traced on a
# 0.667x zoom of the top right (source = 900 + x / 0.667, y / 0.667)
z = 0.667
bottle = [(100, 0), (375, 0), (372, 200), (355, 250), (320, 280), (260, 290), (180, 285), (130, 265), (105, 235), (100, 200)]
glass = [(305, 110), (330, 60), (400, 35), (511, 25), (511, 445), (450, 440), (400, 425), (355, 400), (325, 360), (310, 300)]
matte("hintlesham", HIN, [[(900 + x / z, y / z) for x, y in p] for p in (bottle, glass)])
# the plate and pudding: a band across the frame from the rim to the plate's front edge
ramp("wildboar", WB, 0.1, 1405, 1920, 0.9)
d = np.asarray(Image.open(os.path.join(HERE, "depth", "wildboar.png")), np.float32) / 255
d[: 1405] = 0.1
d = np.where(np.arange(d.shape[0])[:, None] >= 1405, np.maximum(d, 0.5), d)
Image.fromarray((d * 255).astype(np.uint8)).save(os.path.join(HERE, "depth", "wildboar.png"))
matte("wildboar", WB, [[(0, 640), (150, 590), (540, 545), (930, 590), (1080, 640), (1080, 1385), (900, 1405), (540, 1415), (180, 1405), (0, 1385)]])
ramp("langshott", LAN, 0.25, 1450, 1920, 0.9)
print("done")

# Ruthin's breakfast table (Scott's photo, 1 Nov, 1024x679; "did you add the depth"): the wall, window, chair, plate and
# ramekin one far plane (the sideways glide would lean the chair and the bowl on a ramp; as a rigid layer the plate slid
# past the chair's corner and the fill smeared red), the tablecloth in front of the plate a ramp coming forward
RU = "hotels/ruthin-castle/breakfast-window.jpg"
w, h = Image.open(os.path.join(PUB, RU)).size
yy = np.arange(h, dtype=np.float32)[:, None]
d = (0.2 + 0.7 * np.clip((yy - 520) / (h - 520), 0, 1)) * np.ones((1, w), np.float32)
Image.fromarray((d * 255).astype(np.uint8)).save(os.path.join(HERE, "depth", "ruthin.png"))
