"""AMC 2026 collage (Scott, 21 Oct): day to night. The welcome stand and the balloons team shot
side by side on top, square; the Table 3 selfie full width beneath at its own 4:3 (a narrower
crop cut the faces at its edges, and the balloons needed their width). 4:5 for LinkedIn, thin
black gutters, the same light finish as the gala post.

  python3 scripts/amc-collage.py ASSET_DIR OUT.jpg
"""
import sys

import cv2
import numpy as np
from PIL import Image, ImageOps

d, out = sys.argv[1:3]
W, H, G = 1080, 1350, 6
SQ = (W - G) // 2  # the two squares on top
BOT_H = H - SQ - G


def fit(path, w, h, box=None):
    """Crop to box (x0, y0, x1, y1) if given, then to w:h about its centre, then scale."""
    im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    if box:
        im = im.crop(box)
    return ImageOps.fit(im, (w, h), Image.LANCZOS)


def finish(im, lift):
    lab = cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2LAB)
    L = lab[..., 0].astype(np.float32)
    L = 0.7 * L + 0.3 * cv2.createCLAHE(1.6, (8, 8)).apply(lab[..., 0]).astype(np.float32)
    L = L + lift * 255 * (1 - L / 255) ** 2
    lab[..., 0] = np.clip(L, 0, 255).astype(np.uint8)
    return Image.fromarray(cv2.cvtColor(lab, cv2.COLOR_LAB2RGB))


# the stand, both of them and the flowers; the balloons, all four and both stars
stand = finish(fit(f"{d}/welcome-stand.jpg", SQ, SQ, (270, 210, 1530, 1470)), 0.0)
balloons = finish(fit(f"{d}/team-balloons-25-years-wide.jpg", SQ, SQ, (0, 110, 1200, 1310)), 0.03)
selfie = finish(fit(f"{d}/table-3-selfie.jpg", W, BOT_H), 0.02)

c = Image.new("RGB", (W, H), (0, 0, 0))
c.paste(stand, (0, 0))
c.paste(balloons, (SQ + G, 0))
c.paste(selfie, (0, SQ + G))
c.save(out, quality=94)
print("ok")
