"""Lift Lily's drawing off her notebook photo: the ink only (no ruled lines, no notes, no
crossed-out name), upscaled smooth, her letters filled white, the blood red, the fingerprint
yellow. Writes art.png (RGBA) and a debug view."""
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

S = 3  # upscale
src = Image.open("sketch.png").convert("L").crop((60, 780, 1100, 1500))
big = src.resize((src.width * S, src.height * S), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
g = np.asarray(big).astype(float)
H, W = g.shape

# ink: darker than the ruled lines (they sit ~105-130, the pen ~10-60)
ink = g < 88

# her notes, the guide line, the small thumbnail, the crossed-out name, the desk (crop coords)
masks = [
    (0, 0, 1040, 36),        # thumbnail edge / top
    (470, 0, 775, 62),       # "big block white writing"
    (478, 62, 512, 138),     # its pointer
    (0, 176, 182, 258),      # "magnifying glass"
    (840, 34, 990, 96),      # "finger print"
    (872, 292, 1022, 364),   # "butter knife"
    (925, 340, 975, 371),    # the foot of its "k", above the blade tip
    (162, 470, 338, 562),    # "blood splatter"
    (340, 626, 885, 720),    # "L.G. THOMSON" crossed out
    (1003, 0, 1040, 720),    # the desk at the right edge
]
for x0, y0, x1, y1 in masks:
    ink[y0 * S:y1 * S, x0 * S:x1 * S] = False

# drop specks
lab, n = ndi.label(ink)
sizes = ndi.sum(ink, lab, range(1, n + 1))
keep = np.zeros(n + 1, bool)
keep[1:] = sizes > 400
ink = keep[lab]

# regions: close small gaps in the pen line so the letters seal, then find enclosed areas
sealed = ndi.binary_closing(ink, structure=np.ones((21, 21)), iterations=1)
free = ~sealed
rl, rn = ndi.label(free)
border = set(np.unique(np.concatenate([rl[0], rl[-1], rl[:, 0], rl[:, -1]]))) - {0}
outside = np.isin(rl, list(border))
near_out = ndi.binary_dilation(outside, iterations=24)

fill = np.zeros((H, W, 4), np.uint8)
WHITE = (255, 255, 255, 255)
RED = (214, 32, 63, 255)
YEL = (255, 216, 61, 255)
LENS = (255, 246, 201, 170)
objs = ndi.find_objects(rl)
for i, sl in enumerate(objs, start=1):
    if i in border or sl is None:
        continue
    reg = rl[sl] == i
    area = reg.sum()
    if area < 300:
        continue
    cy = (sl[0].start + sl[0].stop) / 2 / S
    cx = (sl[1].start + sl[1].stop) / 2 / S
    body = (near_out[sl] & reg).any()  # a letter's body touches the outside; a counter does not
    if 215 <= cx <= 305 and 395 <= cy <= 470:
        col = RED  # the blood
    elif 845 <= cx <= 930 and 90 <= cy <= 170:
        col = YEL  # the fingerprint's ridges
    elif 85 <= cx <= 165 and 55 <= cy <= 135:
        col = LENS  # the magnifying glass lens
    elif 830 <= cx <= 935 and 360 <= cy <= 510:
        # the butter knife in blue (Lily): a pale steel blade, a bright blue handle
        col = (205, 226, 246, 255) if cy < 425 else (58, 132, 230, 255)
    elif 320 <= cx <= 810 and 550 <= cy <= 632:
        col = YEL  # the circles of THOMSON's O's, yellow (Scott)
    elif body:
        col = WHITE
    else:
        continue  # a counter: the pink shows through
    fill[sl][reg] = col
    if 830 <= cx <= 935 and 360 <= cy <= 510:
        print("knife region", round(cx), round(cy), area)

# the blood: its outline is left open in places, so fill the shape the pen draws round
by0, by1, bx0, bx1 = 390 * S, 472 * S, 205 * S, 312 * S
blood = ndi.binary_closing(ink[by0:by1, bx0:bx1], structure=np.ones((41, 41)))
blood = ndi.binary_fill_holes(blood) & ~ink[by0:by1, bx0:bx1]
reg = fill[by0:by1, bx0:bx1]
reg[blood] = RED

# the fingerprint: the whole oval yellow under her swirls
fy0, fy1, fx0, fx1 = 88 * S, 172 * S, 842 * S, 934 * S
fp = ndi.binary_closing(ink[fy0:fy1, fx0:fx1], structure=np.ones((25, 25)))
fp = ndi.binary_fill_holes(fp) & ~ink[fy0:fy1, fx0:fx1]
fill[fy0:fy1, fx0:fx1][fp] = YEL

# a yellow highlighter swipe under her name (a slight tilt, ragged ends)
from PIL import ImageDraw
hl = Image.new("L", (W, H), 0)
d = ImageDraw.Draw(hl)
d.polygon([(300 * S, 572 * S), (818 * S, 566 * S), (824 * S, 618 * S), (306 * S, 626 * S)], fill=255)
hl = np.asarray(hl.filter(ImageFilter.GaussianBlur(2))) > 128
fill[hl & (fill[..., 3] == 0)] = YEL

# the ink, solid near-black, its edge kept soft from the upscale
inkmask = ndi.binary_dilation(ink, iterations=1)
a = np.clip((128 - g) / 70.0, 0, 1)
a = np.where(inkmask, a, 0)
out = fill.astype(float)
for c in range(3):
    out[..., c] = out[..., c] * (1 - a) + 20 * a
out[..., 3] = np.maximum(out[..., 3], a * 255)
art = Image.fromarray(out.astype(np.uint8), "RGBA")
full = art
art = art.crop(art.getbbox())  # tight to her drawing
art.save("art.png")
# her own cover sketch puts the title up top and her name at the bottom: save them apart too
cut = 540 * S
t = full.crop((0, 0, W, cut)); t.crop(t.getbbox()).save("art-title.png")
nm = full.crop((0, cut, W, H)); nm.crop(nm.getbbox()).save("art-name.png")
print("art", art.size)

print(W, H)
