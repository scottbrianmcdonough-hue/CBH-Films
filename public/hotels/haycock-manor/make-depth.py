#!/usr/bin/env python3
"""Hand-made depth maps for the Haycock Manor depth reel (white near; Scott: "always do by hand,
more precise"): every object one solid block at its own depth, so nothing bends on the move; a
table or floor running toward the camera is a ramp. Polygons are in the photo's own pixels.
Writes depth/<name>.png beside the photos. Usage: python3 make-depth.py"""
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))


def build(name, base, regions, ramp=None):
    img = Image.open(os.path.join(HERE, name + ".jpg"))
    W, H = img.size
    d = np.full((H, W), base, np.float32)
    if ramp:  # (y0, v0, y1, v1): a floor or table running toward the camera
        y0, v0, y1, v1 = ramp
        yy = np.arange(H)[:, None].astype(np.float32)
        t = np.clip((yy - y0) / (y1 - y0), 0, 1)
        d = np.where(yy >= y0, np.maximum(d, v0 + t * (v1 - v0)), d)
    canvas = Image.fromarray((d * 255).astype(np.uint8))
    dr = ImageDraw.Draw(canvas)
    for value, poly in regions:
        dr.polygon(poly, fill=int(value * 255))
    os.makedirs(os.path.join(HERE, "depth"), exist_ok=True)
    canvas.save(os.path.join(HERE, "depth", name + ".png"))
    print(name, img.size)


# the smoky pour: the brick wall far, the carved table running toward the camera; the glass on
# its coaster with the rosemary, the stream and the carafe in the hand one near block (so the
# pour never breaks), the cloche just behind the glass
build("cocktail-smoke", 0.12, [
    (0.55, [(990, 800), (1230, 800), (1235, 1115), (985, 1115)]),
    (0.74, [(720, 380), (1000, 150), (1310, 110), (1600, 120), (1620, 330), (1560, 470), (1080, 520),
            (880, 640), (830, 650), (826, 790)]),
    (0.75, [(560, 760), (950, 760), (950, 1050), (1045, 1095), (1040, 1280), (480, 1280), (420, 1225),
            (420, 1100), (560, 1060)]),
], ramp=(880, 0.42, 1440, 0.95))

# the blue lounge: the panelled walls far, the floor running toward the camera; the grey chairs
# and the window chair mid-room, the console and the vase, the orange tub chairs and the round
# table nearest, the chesterfield bottom right, the chandelier hanging mid
build("blue-lounge", 0.18, [
    (0.4, [(90, 0), (420, 0), (420, 250), (90, 250)]),
    (0.42, [(500, 575), (960, 570), (960, 760), (720, 830), (505, 830)]),
    (0.46, [(975, 600), (1205, 610), (1205, 845), (975, 845)]),
    (0.5, [(1330, 400), (1570, 400), (1720, 700), (1710, 950), (1330, 950)]),
    (0.82, [(135, 735), (500, 735), (830, 760), (830, 1080), (130, 1080)]),
    (0.88, [(20, 920), (490, 920), (490, 1080), (20, 1080)]),
    (0.86, [(1540, 850), (1920, 850), (1920, 1080), (1540, 1080)]),
], ramp=(680, 0.25, 1080, 0.92))

# afternoon tea: the stone wall far; the stack of oak boxes (and the bowls on it) one block,
# the stone table running toward the camera, the plates of sandwiches at the front nearest
build("afternoon-tea", 0.1, [
    (0.6, [(940, 88), (1340, 88), (1340, 410), (1500, 410), (1500, 1230), (800, 1230), (800, 955),
           (680, 955), (680, 660), (745, 660), (745, 528), (1060, 528), (1060, 410), (940, 410)]),
    (0.86, [(300, 1000), (720, 1000), (990, 1190), (985, 1330), (480, 1330), (300, 1190)]),
], ramp=(1080, 0.5, 1434, 0.96))

# the birdcage restaurant: the glazed end wall and the ceiling far, the floor running toward the
# camera; the two birdcage chandeliers hanging mid-room, the olive tree and the blue banquette
# round it mid, the tables and chairs at the front nearest
build("birdcage-restaurant", 0.16, [
    (0.42, [(1178, 290), (1348, 290), (1348, 665), (1178, 665)]),
    (0.55, [(905, 0), (1165, 0), (1165, 590), (905, 590)]),
    (0.58, [(300, 300), (1000, 300), (1080, 760), (890, 1180), (420, 1180), (420, 760)]),
    (0.86, [(150, 1030), (560, 1030), (560, 1282), (150, 1282)]),
    (0.9, [(1410, 1060), (1760, 1060), (1760, 1282), (1410, 1282)]),
], ramp=(900, 0.32, 1282, 0.95))

# the Prévost plate from above: the plate low, its rim a touch higher, the dish on it raised
build("prevost-plate", 0.28, [
    (0.6, [(500, 470), (900, 450), (1380, 640), (1300, 1000), (1230, 1450), (800, 1470), (380, 1480),
           (330, 1200), (330, 820)]),
])

# the gold bath: the tiled wall far, the stone pillar a touch nearer, the tap, the bath and
# the vanity with its gold basin near
build("gold-bath", 0.14, [
    (0.24, [(770, 0), (1360, 0), (1360, 650), (770, 650)]),
    (0.62, [(340, 450), (475, 450), (475, 690), (340, 690)]),
    (0.78, [(0, 640), (1030, 650), (1030, 1262), (0, 1262)]),
    (0.72, [(1015, 455), (1890, 455), (1920, 580), (1920, 1262), (1015, 1262)]),
])

# the beamed bedroom: the far wall and the wardrobes back, the inglenook on the left nearer, the
# bed mid-room, the chandelier hanging mid, the velvet sofa at its foot near, the floor running
# toward the camera, the desk and chair bottom right nearest
build("beamed-bedroom", 0.18, [
    (0.36, [(0, 70), (380, 160), (380, 960), (0, 1000)]),
    (0.44, [(495, 0), (830, 0), (830, 320), (495, 320)]),
    (0.46, [(1000, 495), (1420, 495), (1430, 1060), (1000, 1060)]),
    (0.7, [(615, 750), (1315, 750), (1315, 1190), (615, 1190)]),
    (0.9, [(1640, 900), (1920, 900), (1920, 1266), (1640, 1266)]),
], ramp=(820, 0.28, 1266, 0.95))


# ---------------------------------------------------------------------------------------------
# Warp-free versions (Scott: "watch the warping"): a block's softened edge stretched the wall or
# floor round it (bricks bending by the tea boxes, the tiles by the bath, the bed's edge). Now
# each shot's main object is a matte moved as one rigid layer over its background (still-depth-
# dolly.py --layer, filled behind), and the background map holds only flat walls and smooth
# ramps, so nothing can bend. Writes depth/<name>-bg.png and depth/<name>-matte.png.
def layered(name, base, poly, ramp=None, soft=3):
    build(name, base, [], ramp=ramp)
    os.replace(os.path.join(HERE, "depth", name + ".png"), os.path.join(HERE, "depth", name + "-bg.png"))
    img = Image.open(os.path.join(HERE, name + ".jpg"))
    m = Image.new("L", img.size, 0)
    for p in poly:
        ImageDraw.Draw(m).polygon(p, fill=255)
    m.filter(ImageFilter.GaussianBlur(soft)).save(os.path.join(HERE, "depth", name + "-matte.png"))


# the pour: the glass, its coaster and rosemary, the stream and the carafe in the hand
layered("cocktail-smoke", 0.12, [
    [(560, 760), (950, 760), (950, 1050), (1045, 1095), (1040, 1280), (480, 1280), (420, 1225), (420, 1100),
     (560, 1060)],
    [(720, 380), (1000, 150), (1310, 110), (1600, 120), (1620, 330), (1560, 470), (1080, 520), (880, 640),
     (830, 650), (826, 790), (790, 790), (790, 640)],
], ramp=(880, 0.42, 1440, 0.9))
# the lounge: the grey chairs and the window chair
layered("blue-lounge", 0.2, [
    [(500, 575), (960, 570), (960, 760), (720, 830), (505, 830)],
    [(975, 600), (1205, 610), (1205, 845), (975, 845)],
], ramp=(840, 0.3, 1080, 0.7))
# afternoon tea: the stack of oak boxes and the bowls on it
layered("afternoon-tea", 0.1, [
    [(940, 88), (1340, 88), (1340, 410), (1500, 410), (1500, 1230), (800, 1230), (800, 955), (680, 955),
     (680, 660), (745, 660), (745, 528), (1060, 528), (1060, 410), (940, 410)],
], ramp=(1230, 0.55, 1434, 0.9))
# the bath with its tap
layered("gold-bath", 0.14, [
    [(0, 640), (340, 642), (340, 450), (475, 450), (475, 645), (1030, 650), (1030, 1262), (0, 1262)],
])
# the bedroom: the velvet sofa at the foot of the bed
layered("beamed-bedroom", 0.18, [
    [(615, 750), (1315, 750), (1315, 1190), (615, 1190)],
], ramp=(1080, 0.3, 1266, 0.75))
# the birdcage room and the plate from above: no object layers (thin wires, an irregular dish), a
# smooth floor ramp or none


# Second pass (the rough rectangles above carried bits of wall and table with them, so the fill
# showed as smudged boxes): the mattes traced tight to the objects, each layer standing at the
# depth of the ramp where it touches the table (so no seam opens at its foot), and the sharp
# interiors (lounge, bath, bedroom) moved on smooth ramps only: no edges, so nothing can bend.
def tight(name, base, polys, ramp=None, soft=2):
    layered(name, base, [[(x * 2, y * 2) for x, y in p] for p in polys], ramp=ramp, soft=soft)


# the pour (traced at half scale): the glass, its pick and rosemary on the coaster; the stream;
# the carafe with the hand and sleeve running off the top
tight("cocktail-smoke", 0.12, [
    [(283, 384), (300, 378), (470, 372), (470, 396), (467, 425), (466, 538), (505, 553), (518, 580),
     (512, 610), (490, 628), (440, 640), (380, 643), (310, 637), (262, 623), (242, 602), (240, 580),
     (214, 566), (226, 548), (262, 546), (289, 522), (288, 410)],
    [(397, 300), (413, 300), (413, 425), (397, 425)],
    [(356, 260), (358, 220), (364, 195), (376, 179), (395, 172), (420, 174), (440, 178), (560, 128), (640, 92), (652, 40), (668, 0), (960, 0),
     (960, 52), (800, 64), (806, 120), (800, 190), (772, 236), (700, 252), (560, 266), (470, 296),
     (432, 324), (396, 324), (360, 308)],  # the mouth's whole rim, with room
], ramp=(700, 0.12, 1440, 0.9))  # continuous from the wall: no step to tear along
# afternoon tea: the four boxes and the two bowls, standing on the slab
tight("afternoon-tea", 0.1, [
    [(470, 44), (668, 44), (668, 205), (748, 205), (748, 352), (678, 352), (678, 462), (748, 462), (748, 611), (408, 611), (398, 595), (398, 580),
     (408, 578), (408, 478), (343, 478), (330, 470), (330, 440), (343, 438), (343, 333), (372, 333),
     (372, 300), (380, 278), (400, 266), (418, 262), (440, 280), (450, 286), (470, 282), (500, 283),
     (528, 290), (530, 205), (470, 207)],
], ramp=(900, 0.1, 1434, 0.9))  # continuous: a step at 1080 tore a line across the wall


# The meeting rooms (Scott's photos from the CBH meeting rooms page, 31 Oct, for the landscape
# meetings and events cut): wide-angle room shots, so the depth is the room itself, smooth with no
# object edges to bend: the floor (and the tables on it) rising toward the camera from the far
# wall's foot, the ceiling coming nearer toward the top of the frame. Writes depth/<name>-room.png.
def room(name, ceil_to, floor_from, far=0.15, ceil_near=0.45, floor_near=0.9):
    img = Image.open(os.path.join(HERE, name + ".jpg"))
    W, H = img.size
    yy = np.arange(H, dtype=np.float32)[:, None]
    ceil = far + (ceil_near - far) * np.clip(1 - yy / ceil_to, 0, 1) ** 1.5
    floor = far + (floor_near - far) * np.clip((yy - floor_from) / (H - floor_from), 0, 1)
    d = np.maximum(ceil, floor) * np.ones((1, W), np.float32)
    Image.fromarray((d * 255).astype(np.uint8)).save(os.path.join(HERE, "depth", name + "-room.png"))


room("meeting-fitzwilliam", 260, 600)
room("meeting-manor-suite", 300, 600)
room("meeting-boardroom-stone", 280, 640)
room("meeting-boardroom-oval", 300, 650)
room("meeting-boardroom-small", 250, 640)
