#!/usr/bin/env python3
"""The magnet CB's hotel opening (Scott, 31 Oct: the magnet reel has "got to make it relate to CB somehow, or
hotels"): each hotel photo, cropped to 9:16, gives up its brightest warm points (flames, candlelight, lit glass,
gold) as the filings' starting places. Writes public/campaigns/magnet/hotels/<k>.jpg (the crops the film shows)
and src/hotel-film/magnet/hotel-glints.json ([x, y, k] per filing, as many as cb-filings.json has points).
Usage: python3 scripts/magnet-hotel-glints.py"""
import json
import os

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")
# (photo, focus x and y 0..1, zoom): candles, the fireside whisky, the Kingfisher's lanterns, Haycock's gold basin
# (close, so the gold fills the frame rather than the pale stone beside it)
PHOTOS = [
    ("campaigns/screen-time/lwb-candles-poster.jpg", 0.5, 0.5, 1.0),
    ("hotels/hogarths-stone-manor/fireside-whisky.jpg", 0.5, 0.5, 1.0),
    ("hotels/the-kingfisher/fireside.jpg", 0.33, 0.5, 1.0),
    ("hotels/haycock-manor/gold-bath.jpg", 0.845, 0.47, 1.55),
]
W, H = 1080, 1920
n_total = len(json.load(open(os.path.join(ROOT, "src/hotel-film/magnet/cb-filings.json"))))
rng = np.random.default_rng(7)
out = []
for k, (p, fx, fy, zoom) in enumerate(PHOTOS):
    im = Image.open(os.path.join(PUB, p)).convert("RGB")
    s = max(W / im.width, H / im.height) * zoom
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    left = int(np.clip(fx * im.width - W / 2, 0, im.width - W))
    top = int(np.clip(fy * im.height - H / 2, 0, im.height - H))
    im = im.crop((left, top, left + W, top + H))
    im.save(os.path.join(PUB, f"campaigns/magnet/hotels/{k}.jpg"), quality=90)
    a = np.asarray(im.filter(ImageFilter.GaussianBlur(2)), np.float32) / 255
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = 0.3 * r + 0.59 * g + 0.11 * b
    warm = np.clip(r - b, 0, 1)
    # bright and warm: flames, candlelight, lit whisky, gold (not white worktops or pale stone)
    score = np.clip(lum - 0.4, 0, None) ** 2 * (0.03 + warm) ** 2
    score[:60] = score[-60:] = 0
    score[:, :30] = score[:, -30:] = 0
    n = n_total // len(PHOTOS) + (1 if k < n_total % len(PHOTOS) else 0)
    flat = score.ravel() / score.sum()
    idx = rng.choice(flat.size, size=n, replace=False, p=flat)
    ys, xs = np.divmod(idx, W)
    out += [[int(x), int(y), k] for x, y in zip(xs, ys)]
    print(p, "->", n, "glints")
json.dump(out, open(os.path.join(ROOT, "src/hotel-film/magnet/hotel-glints.json"), "w"))
print(len(out), "filings")
