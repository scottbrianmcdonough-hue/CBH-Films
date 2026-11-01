"""Add Georgina to the Gala Awards Dinner team photo (Bianca, 21 Oct).

Her only usable photo is a candid on the dance floor (50.jpg): laughing, mid-stride, walking to
the right. She is cut out with rembg (isnet-general-use), matched to the team shot's light from
the people next to her, and set behind them; whoever is in front of her is traced by hand (the
rembg masks of the team were poor under the magenta light).

Placements tried (PLACE):
  centre  back row, light blazer to check suit, head and a shoulder. Bianca: her neck looked "so
          twisted" (head right, shoulder dropping left), and she's looking right: move her left.
  left    back row, off-shoulder dress to light blazer, her head only over his shoulder. Scott:
          "looks like just a head poking out".
  edge    the left end of the line-up, all of her, walking in towards the group from the left,
          a step behind the first woman (Bianca, in the turtleneck). Bianca: "how about between
          me and Katie?"
  bianca-katie  just behind, between Bianca and Katie (off-shoulder): her face in the gap,
          laughing towards Katie, her neck and neckline down to where their shoulders meet.

Scott: the denoised face looked "too smeared, go with the sharper image": light sharpening only.

  python3 scripts/gala-composite.py TEAM.webp GEORGINA.jpg OUT.jpg [bianca-katie|edge|left|centre]
"""
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from rembg import new_session, remove

team_p, g_p, out_p = sys.argv[1:4]
PLACE = sys.argv[4] if len(sys.argv) > 4 else "bianca-katie"

# In 50.jpg the back of her hair is at x 335 and its top at y 265.
PLACES = {
    "edge": dict(
        crop=(100, 200, 640, 1060), scale=1.18, left=3, top=620,
        faces=[(195, 650, 280, 740)],  # the first woman
        dark=(170, 880, 300, 1000),  # her dark top
        # the first woman, in front of her: her left outline, hair to heel
        front=[(190, 612), (240, 600), (420, 600), (420, 1600), (220, 1540), (200, 1530),
               (155, 1490), (165, 1470), (192, 1435), (200, 1360), (202, 1310), (205, 1220),
               (195, 1210), (190, 1160), (185, 1110), (175, 1060), (170, 1040), (165, 990),
               (155, 940), (150, 890), (147, 840), (147, 790), (150, 740), (152, 690),
               (160, 650), (172, 628)],
        feet=(170, 1506, 48, 8),  # her planted front foot on the stage: centre x, y, radii
        # her hand, then her legs: (rows), (her skin there, the first woman's there)
        limbs=[((950, 1170), ((0, 1010, 40, 1110), (330, 880, 365, 920))),
               ((1170, 1600), ((135, 1230, 180, 1380), (215, 1250, 260, 1400)))],
    ),
    "bianca-katie": dict(
        crop=(240, 240, 600, 620), scale=1.1, left=239, top=560,
        faces=[(400, 640, 460, 720), (195, 650, 280, 740)],  # Katie, Bianca
        # Scott: "but then she has no body": under their skirts there is backdrop between
        # Bianca's legs and Katie's long dress, so her front leg and sandal stand in it, on the
        # back of the stage (her sole, 472, 1015 in 50.jpg, where the back row's feet are);
        # starting just under her hem (more of her dress read as a black block, Scott)
        body=dict(crop=(400, 700, 600, 1040), scale=1.1, anchor=(472, 1015), at=(318, 1466),
                  # the top runs up from Bianca's hem to Katie's dress, so her own hem tucks
                  # behind Katie (cut straight across, her leg looked chopped off)
                  gap=[(320, 1208), (346, 1168), (346, 1385), (372, 1388), (386, 1395),
                       (388, 1445), (384, 1472), (282, 1472), (282, 1360), (295, 1325),
                       (315, 1275)],
                  # Scott: "it looks like one leg": her other foot beside it under Katie's hem.
                  # The other leg in her photo is lifted mid-stride, so it is the planted one
                  # mirrored, toes turned out
                  other=dict(at=(372, 1470),
                             gap=[(330, 1386), (346, 1385), (372, 1388), (386, 1395), (388, 1445),
                                  (384, 1474), (330, 1474)])),
        feet=(345, 1468, 50, 6),
        limbs=[((1150, 1600), ((300, 1250, 345, 1380), (215, 1250, 260, 1400)))],
        dark=(350, 900, 420, 1000),
        # the backdrop between Bianca (turtleneck) and Katie (off-shoulder): her face in the gap
        # at head height, her neck and neckline down to where their shoulders meet
        gap=[(200, 470), (470, 470), (470, 600), (440, 603), (413, 607), (395, 615), (380, 630),
             (373, 670), (377, 720), (357, 747), (340, 780), (337, 797), (330, 813), (320, 827),
             (310, 830), (307, 820), (293, 770), (283, 720), (273, 670), (253, 630), (240, 627),
             (200, 615)],
    ),
    "katie-chris": dict(
        # Bianca's other pick: her head beside Chris's (light blazer) as in "left", and, as she
        # is mid-stride, her stepping leg in the gap between his legs, both feet on the stage
        crop=(240, 240, 600, 620), scale=1.12, left=490, top=556,
        faces=[(400, 640, 460, 720), (640, 570, 720, 650)],  # Katie, Chris
        dark=(350, 900, 420, 1000),
        gap=[(440, 470), (660, 470), (650, 525), (640, 537), (632, 557), (630, 590), (632, 630),
             (635, 653), (627, 667), (590, 668), (540, 672), (507, 677), (483, 683), (474, 683),
             (470, 647), (460, 620), (447, 610), (440, 600)],
        body=dict(crop=(400, 700, 600, 1040), scale=1.1, anchor=(472, 1015), at=(640, 1470),
                  gap=[(635, 1100), (650, 1135), (670, 1185), (680, 1215), (675, 1260),
                       (667, 1310), (657, 1360), (652, 1410), (700, 1422), (710, 1450),
                       (705, 1478), (640, 1478), (635, 1430), (630, 1360), (625, 1310),
                       (620, 1265), (625, 1210), (630, 1160)],
                  other=dict(at=(690, 1474),
                             gap=[(652, 1415), (700, 1422), (710, 1450), (705, 1478),
                                  (652, 1478)])),
        feet=(665, 1472, 45, 6),
        limbs=[((1100, 1600), ((628, 1250, 660, 1380), (215, 1250, 260, 1400)))],
    ),
    "left": dict(
        crop=(240, 240, 600, 620), scale=1.12, left=490, top=556,
        faces=[(820, 675, 890, 740), (640, 570, 720, 650)],
        dark=(350, 900, 420, 1000),
        # the backdrop she shows through: off-shoulder dress to the top of the blazer's shoulder
        gap=[(440, 470), (660, 470), (650, 525), (640, 537), (632, 557), (630, 590), (632, 630),
             (635, 653), (627, 667), (590, 668), (540, 672), (507, 677), (483, 683), (474, 683),
             (470, 647), (460, 620), (447, 610), (440, 600)],
    ),
    "centre": dict(
        crop=(240, 240, 600, 620), scale=1.0, left=745, top=525,
        faces=[(820, 675, 890, 740), (640, 570, 720, 650)],
        dark=(350, 900, 420, 1000),
        gap=[(690, 470), (960, 470), (950, 530), (940, 555), (934, 570), (935, 602), (940, 625),
             (880, 642), (860, 637), (840, 640), (820, 652), (810, 670), (802, 715), (785, 700),
             (760, 680), (740, 662), (727, 645), (731, 625), (735, 602), (736, 582), (727, 555),
             (715, 542), (690, 530)],
    ),
}
P = PLACES[PLACE]
S = P["scale"]
cx0, cy0 = P["crop"][:2]

team = Image.open(team_p).convert("RGB")
src = Image.open(g_p).convert("RGB")
t = np.asarray(team).astype(np.float32)
H, W = t.shape[:2]

# one cutout of all of her; each placement takes the part it needs
FULL = (100, 200, 640, 1060)
full = src.crop(FULL)
full_alpha = remove(full, session=new_session("isnet-general-use"), only_mask=True)


def cutout(b, scale, flip=False):
    """The part of her in box b of 50.jpg, scaled (and mirrored)."""
    rel = (b[0] - FULL[0], b[1] - FULL[1], b[2] - FULL[0], b[3] - FULL[1])
    crop, alpha = full.crop(rel), full_alpha.crop(rel)
    if flip:
        crop, alpha = crop.transpose(Image.FLIP_LEFT_RIGHT), alpha.transpose(Image.FLIP_LEFT_RIGHT)
    size = (round(crop.size[0] * scale), round(crop.size[1] * scale))
    g = np.asarray(crop.resize(size, Image.LANCZOS)).astype(np.float32)
    # pulled in a pixel and softened, so no fringe of her own room's lighter wall rims her
    ga = alpha.resize(size, Image.LANCZOS).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    ga = np.clip(np.asarray(ga).astype(np.float32) / 255 * 1.35, 0, 1)  # rembg left her hair see-through
    return g, ga


def box(a, b, off=(0, 0)):
    x0, y0, x1, y1 = b
    return a[y0 - off[1]:y1 - off[1], x0 - off[0]:x1 - off[0]].reshape(-1, 3).astype(np.float32)


def skin(px):
    return px[px.mean(1) > 90]  # skin only: no hair, mouth or teeth shadow


# light: her face to the faces next to her, channel by channel
s_np = np.asarray(src)
face_src = skin(box(s_np, (372, 290, 440, 360)))
face_dst = np.concatenate([skin(box(t, b)) for b in P["faces"]])
ms, ss = face_src.mean(0), face_src.std(0) + 1e-3
md, sd = face_dst.mean(0), face_dst.std(0) + 1e-3
gain = np.clip(sd / ss, 0.8, 1.35)
# her black dress and the shadows: to the dark clothes next to her, which the light tints
dark_src = box(s_np, (300, 420, 360, 500))
dark_dst = box(t, P["dark"])
rng = np.random.default_rng(3)


def grade(g, ga):
    lit = (g - ms) * gain + md
    lum = lit.mean(2, keepdims=True)
    lit = lum + (lit - lum) * 1.3  # her photo is flatter than the stage-lit faces
    shade = g - dark_src.mean(0) + dark_dst.mean(0)
    k = np.clip((g.mean(2, keepdims=True) - dark_src.mean()) / (ms.mean() - dark_src.mean()), 0, 1)
    g = np.clip(shade * (1 - k) + lit * k, 0, 255)
    # her soft edges still carry her own room's paler wall: take their colour from just inside
    inside = (ga > 0.9).astype(np.float32)[..., None]
    fill = cv2.GaussianBlur(g * inside, (0, 0), 3) / (cv2.GaussianBlur(inside, (0, 0), 3)[..., None] + 1e-4)
    g = np.where(inside > 0, g, fill)
    # a little crisper, with fine grain like the team shot (no denoise: it smeared her face)
    g = np.asarray(Image.fromarray(g.astype(np.uint8)).filter(ImageFilter.UnsharpMask(1.6, 75, 3)))
    return np.clip(g.astype(np.float32) + rng.normal(0, 1.6, g.shape), 0, 255)


def region(poly=None, front=None):
    r = Image.new("L", team.size, 0)
    if poly:
        ImageDraw.Draw(r).polygon(poly, fill=255)
    else:
        r.paste(255, (0, 0, W, H))
        ImageDraw.Draw(r).polygon(front, fill=0)
    return np.asarray(r.filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255


a = np.zeros((H, W), np.float32)
layer = np.zeros_like(t)
m = np.zeros((H, W), np.float32)


def place(b, scale, anchor, at, where, flip=False):
    """Set the part of her in box b so that point `anchor` of 50.jpg lands on `at`."""
    global a, layer, m
    g, ga = cutout(b, scale, flip)
    g = grade(g, ga)
    ox = at[0] - round(((b[2] - anchor[0]) if flip else (anchor[0] - b[0])) * scale)
    oy = at[1] - round((anchor[1] - b[1]) * scale)
    y0, x0 = max(oy, 0), max(ox, 0)
    y1, x1 = min(oy + g.shape[0], H), min(ox + g.shape[1], W)
    pa = np.zeros((H, W), np.float32)
    pa[y0:y1, x0:x1] = ga[y0 - oy:y1 - oy, x0 - ox:x1 - ox] * where[y0:y1, x0:x1]
    layer[y0:y1, x0:x1] = np.where(pa[y0:y1, x0:x1, None] > 0, g[y0 - oy:y1 - oy, x0 - ox:x1 - ox],
                                   layer[y0:y1, x0:x1])
    a = np.maximum(a, pa)
    m = np.maximum(m, where)
    return ox, oy


# her head and shoulders: the back of her hair (335, 265 in 50.jpg) at left, top
ox, oy = place(P["crop"], S, (335, 265), (P["left"], P["top"]),
               region(P.get("gap"), P.get("front")))
if "body" in P:  # and, where the people in front leave a gap lower down, the rest of her
    B = P["body"]
    if "other" in B:  # her other foot first, so the front leg stands over it
        O = B["other"]
        place(B["crop"], B["scale"], B["anchor"], O["at"], region(O["gap"]), flip=True)
    place(B["crop"], B["scale"], B["anchor"], B["at"], region(B["gap"]))
size = cutout(P["crop"], S)[0].shape[1::-1]

# she casts a soft shadow on the backdrop, like the others
sh = cv2.GaussianBlur(np.roll(a, (8, 5), (0, 1)), (0, 0), 11) * (1 - a)
if "gap" in P:
    sh *= m
t = t * (1 - 0.22 * sh[..., None])
if "feet" in P:  # and stands on the stage
    fx, fy, rx, ry = P["feet"]
    f = np.zeros((H, W), np.float32)
    cv2.ellipse(f, (fx, fy), (rx, ry), 0, 0, 360, 1.0, -1)
    f = cv2.GaussianBlur(f, (0, 0), 8) * m * (1 - a)
    t = t * (1 - 0.5 * f[..., None])
# whoever is in front shades her a little where they cross her
front = cv2.GaussianBlur(1 - m, (0, 0), 4)
layer = layer * (1 - 0.3 * front[..., None])
if "limbs" in P:
    # her face took the faces' light, but her hand and legs were in shadow on the dance floor
    # and came out orange-brown; the team's are pink-lilac, lit from behind by the glow
    lum = layer.mean(2)
    skin_w = np.clip((lum - 45) / 30, 0, 1)[..., None]
    yy = np.arange(H, dtype=np.float32)[:, None, None]
    # lifting dark skin that far shows its noise as speckle: smooth it first (legs and hand
    # only, never her face), then a fine grain back
    limb = np.clip((yy - P["limbs"][0][0][0]) / 30, 0, 1) * skin_w
    smooth = cv2.bilateralFilter(np.clip(layer, 0, 255).astype(np.uint8), 9, 40, 6).astype(np.float32)
    layer = layer * (1 - 0.8 * limb) + smooth * 0.8 * limb
    for (y_from, y_to), (sb, db) in P["limbs"]:
        ramp = np.clip((yy - y_from) / 30, 0, 1) * np.clip((y_to - yy) / 30, 0, 1)
        # skin only on both sides; a leg behind the front row gets a little less of the light
        dim = 0.85 if "body" in P else 1.0
        ratio = skin(box(t, db)).mean(0) * dim / (skin(box(layer, sb)).mean(0) + 1e-3)
        layer = layer * (1 + (ratio - 1) * skin_w * ramp)
    layer = layer + rng.normal(0, 1.6, layer.shape) * limb
# light wrap: the backdrop's glow bleeds round her edges, as it does round everyone else
glow = cv2.GaussianBlur(t * (1 - a[..., None]), (0, 0), 10) / (
    cv2.GaussianBlur(1 - a, (0, 0), 10)[..., None] + 1e-3)
band = cv2.GaussianBlur(np.clip(a - cv2.erode(a, np.ones((9, 9), np.uint8)), 0, 1), (0, 0), 2)
layer = layer + band[..., None] * np.clip(glow - layer, 0, None) * 0.45
out = t * (1 - a[..., None]) + layer * a[..., None]
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(out_p, quality=95)
print(PLACE, "placed at", ox, oy, "size", size, "gain", gain.round(2))
