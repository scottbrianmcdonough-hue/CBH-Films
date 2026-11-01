"""Gala Awards Dinner LinkedIn post (Scott, 21 Oct): the original team shot (no compositing:
Scott, "take Georgina out of the original and do a collage") over the stage moment
(Georgina, left, holding the bottle), so everyone is in without compositing anyone.

4:5 (1080 x 1350, LinkedIn's tallest feed image). Two takes:
  collage  the two photos stacked, a thin black gutter between
  blend    the same, the seam a soft feather through the shared magenta light

  python3 scripts/gala-collage.py TEAM.webp STAGE.jpg OUT_DIR
"""
import sys

import cv2
import numpy as np
from PIL import Image, ImageFilter

team_p, stage_p, out_dir = sys.argv[1:4]
W, H = 1080, 1350
TOP_H = 770  # the team shot
GUTTER = 6

team = Image.open(team_p).convert("RGB")
stage = Image.open(stage_p).convert("RGB")

# the team from the banner to their feet, less empty stage floor below them (polish)
top_h = round(1920 * TOP_H / W)
top = team.crop((0, 240, 1920, 240 + top_h)).resize((W, TOP_H), Image.LANCZOS)


def finish(im, lift):
    """Polish for LinkedIn: a touch of local contrast on lightness only (faces and medals read),
    the shadows lifted by `lift`, colour left as the room's light made it."""
    lab = cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2LAB)
    L = lab[..., 0].astype(np.float32)
    cl = cv2.createCLAHE(1.6, (8, 8)).apply(lab[..., 0]).astype(np.float32)
    L = 0.7 * L + 0.3 * cl
    L = L + lift * 255 * (1 - L / 255) ** 2  # shadows up, highlights untouched
    lab[..., 0] = np.clip(L, 0, 255).astype(np.uint8)
    return Image.fromarray(cv2.cvtColor(lab, cv2.COLOR_LAB2RGB))


top = finish(top, 0.04)
# the winners on stage, the candelabra and a few heads of the room in front; the man filming
# at the left edge left out. The stage photo is softer: a little crisper
bot_h = H - TOP_H - GUTTER
box_w = 1305  # the sponsor boards in, the two men at the left out (Scott)
box_h = round(box_w * bot_h / W)
bx, by = 445, 172  # just clear of the men at the left edge to the winners, the CB logo above
bot = stage.crop((bx, by, bx + box_w, by + box_h)).resize((W, bot_h), Image.LANCZOS)
bot = finish(bot.filter(ImageFilter.UnsharpMask(1.4, 50, 2)), 0.08)  # the darker of the two

collage = Image.new("RGB", (W, H), (0, 0, 0))
collage.paste(top, (0, 0))
collage.paste(bot, (0, TOP_H + GUTTER))
collage.save(f"{out_dir}/gala-post-collage.jpg", quality=94)

# blend: the stage photo taken taller so the two overlap, faded across 120px of the magenta
OVER = 120
bot2_h = H - TOP_H + OVER
box_h2 = round(box_w * bot2_h / W)
by2 = by - (box_h2 - box_h) // 2
bot2 = stage.crop((bx, by2, bx + box_w, by2 + box_h2)).resize((W, bot2_h), Image.LANCZOS)
bot2 = finish(bot2.filter(ImageFilter.UnsharpMask(1.4, 50, 2)), 0.08)
canvas = np.zeros((H, W, 3), np.float32)
canvas[:TOP_H] = np.asarray(top, np.float32)
b = np.asarray(bot2, np.float32)
y0 = TOP_H - OVER
ramp = np.clip(np.arange(bot2_h, dtype=np.float32) / OVER, 0, 1)
ramp = (ramp * ramp * (3 - 2 * ramp))[:, None, None]  # smoothstep
canvas[y0:] = canvas[y0:] * (1 - ramp) + b * ramp
Image.fromarray(np.clip(canvas, 0, 255).astype(np.uint8)).save(f"{out_dir}/gala-post-blend.jpg", quality=94)
print("ok")
