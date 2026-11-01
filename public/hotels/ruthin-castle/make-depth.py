#!/usr/bin/env python3
"""Hand-made depth maps for the Ruthin Castle depth reel (white near; Scott: "always do by
hand, more precise"): every object is one solid block at its own depth, so nothing bends on
the move; only the sky comes from colour (bright, pale or blue pixels joined to the top edge).
Polygons are drawn on a 1200-wide view of each photo and scaled up to the photo.
Writes depth/<name>.png beside the photos. Usage: python3 make-depth.py"""
import os

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))


def sky_mask(img):
    a = np.asarray(img.convert("RGB")).astype(np.float32) / 255
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    pale = (mx > 0.62) & ((mx - mn) < 0.22)  # cloud and haze
    blue = (b > r + 0.06) & (b > 0.45)  # clear sky
    lab, _ = nd.label(pale | blue)
    top = set(np.unique(lab[0])) - {0}
    return np.isin(lab, list(top))


def build(name, base, regions, sky=False, ramp=None):
    img = Image.open(os.path.join(HERE, name + (".jpg")))
    W, H = img.size
    k = W / 1200
    d = np.full((H, W), base, np.float32)
    if ramp:  # (y0, v0, y1, v1): a floor or table running toward the camera, in view px
        y0, v0, y1, v1 = ramp
        yy = np.arange(H)[:, None] / k
        t = np.clip((yy - y0) / (y1 - y0), 0, 1)
        d = np.where(yy >= y0, np.maximum(d, v0 + t * (v1 - v0)), d)
    canvas = Image.fromarray((d * 255).astype(np.uint8))
    dr = ImageDraw.Draw(canvas)
    for value, poly in regions:
        dr.polygon([(x * k, y * k) for x, y in poly], fill=int(value * 255))
    d = np.asarray(canvas).astype(np.float32) / 255
    if sky:
        d[sky_mask(img)] = 0.0
    os.makedirs(os.path.join(HERE, "depth"), exist_ok=True)
    Image.fromarray((d * 255).astype(np.uint8)).save(os.path.join(HERE, "depth", name + ".png"))
    print(name, img.size)


# the clock tower and the castle front: the castle one plane, the red wing on the right a
# little nearer, the hedges and the low wall at the bottom nearest
build("castle", 0.4, [
    (0.52, [(942, 0), (1200, 0), (1200, 600), (980, 600), (942, 560)]),
    (0.62, [(0, 432), (130, 438), (260, 428), (330, 470), (348, 560), (300, 605), (200, 640), (0, 662)]),
], sky=True, ramp=(560, 0.6, 675, 0.95))

# the peacock on the wall: the castle and its trees far, the conifer a touch nearer, the
# stone wall and the plants below nearer, the ledge at the bottom nearest; the peacock one
# solid block standing on the ledge
build("peacock", 0.34, [
    (0.42, [(895, 180), (960, 100), (1030, 108), (1100, 250), (1106, 420), (900, 420)]),
    (0.56, [(1090, 440), (1200, 430), (1200, 800), (1080, 800)]),
    (0.6, [(0, 440), (180, 450), (330, 470), (330, 640), (0, 650)]),
    (0.62, [(745, 440), (1115, 420), (1110, 470), (1085, 700), (1060, 800), (930, 800), (860, 760), (745, 700)]),
    (0.95, [(0, 650), (80, 640), (300, 645), (480, 665), (600, 690), (700, 700), (820, 740), (880, 780),
            (890, 800), (0, 800)]),
    (0.85, [(612, 522), (628, 508), (645, 512), (652, 530), (662, 545), (690, 535), (740, 540), (790, 560),
            (822, 590), (848, 622), (872, 660), (902, 700), (932, 758), (938, 800), (880, 800), (858, 770),
            (828, 732), (800, 702), (780, 684), (748, 692), (742, 730), (736, 736), (700, 732), (690, 702),
            (670, 690), (650, 660), (636, 620), (632, 580), (630, 545), (618, 536)]),
], sky=True)

# the plate by the fire: the fireplace far, the table running toward the camera, the plate
# with the burger, the chips and the skewer one solid block where it sits on the table
build("fireside-plate", 0.15, [
    (0.69, [(332, 605), (400, 580), (430, 500), (432, 470), (470, 430), (528, 424), (528, 312), (544, 312),
            (544, 424), (600, 432), (632, 470), (640, 500), (690, 520), (700, 505), (790, 495), (820, 500),
            (845, 530), (850, 570), (890, 580), (937, 600), (932, 626), (860, 656), (780, 680), (650, 694),
            (520, 690), (420, 676), (345, 646)]),
], ramp=(545, 0.5, 797, 1.0))

# the carved white bed: the curtained wall far, the floor running toward the camera, the
# headboard and pillows mid-room, the carved footboard and its rail nearest, the lamp by the
# window behind
build("white-bed", 0.12, [
    (0.35, [(700, 255), (835, 255), (835, 415), (700, 415)]),
    (0.42, [(275, 182), (470, 122), (668, 205), (668, 420), (300, 500), (275, 480)]),
    (0.5, [(305, 325), (680, 320), (680, 440), (305, 445)]),
    (0.78, [(290, 425), (362, 430), (600, 405), (760, 380), (1000, 372), (1042, 390), (1036, 600),
            (1002, 692), (640, 772), (600, 796), (380, 796), (372, 610), (300, 520)]),
], ramp=(540, 0.3, 796, 0.9))
