"""Sponsor and speaker logos for the AMC 2026 thank-you card, in their own colours.

Each official logo (public/campaigns/amc-2026/logos/src/<name>.png) is trimmed to its edges, never
recoloured (Scott: "use each logo's real colours"), and written to logos/<name>.png. Its tile is
picked from its ink: a white or pale logo (Eventurous, Double Dutch, Wedding Dates' light version)
sits on a charcoal tile, everything else on a light one. Writes src/hotel-film/amc/logos.ts with
each logo's aspect and tile. Run after adding a logo: python3 scripts/amc-logos.py
"""

import glob
import os

import numpy as np
from PIL import Image

DIR = "public/campaigns/amc-2026/logos"
OUT = "src/hotel-film/amc/logos.ts"

rows = []
for path in sorted(glob.glob(f"{DIR}/src/*.png")):
    name = os.path.splitext(os.path.basename(path))[0]
    img = Image.open(path).convert("RGBA")
    im = np.asarray(img).astype(np.float32) / 255
    rgb, a = im[..., :3], im[..., 3]
    # a logo on its own white ground (an opaque corner) has the white as background, not ink
    opaque = (a < 0.03).mean() < 0.01  # no transparent ground at all
    ink = a > 0.03
    if opaque:
        ink &= rgb.min(axis=2) < 0.94
    ys, xs = np.nonzero(ink)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    img.crop(box).save(f"{DIR}/{name}.png")
    lum = rgb @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    mean = float((lum * a)[ink].sum() / a[ink].sum())
    tile = "dark" if mean > 0.75 and not opaque else "light"
    w, h = box[2] - box[0], box[3] - box[1]
    rows.append((name, w / h, tile))
    print(f"{name:20s} {w}x{h} ink {mean:.2f} {tile}")

with open(OUT, "w") as f:
    f.write("// written by scripts/amc-logos.py: each trimmed logo's aspect and the tile it sits on\n")
    f.write("export const LOGOS: Record<string, { a: number; tile: \"light\" | \"dark\" }> = {\n")
    for name, aspect, tile in rows:
        f.write(f'  "{name}": {{ a: {aspect:.3f}, tile: "{tile}" }},\n')
    f.write("};\n")
