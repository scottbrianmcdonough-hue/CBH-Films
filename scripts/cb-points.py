#!/usr/bin/env python3
"""Sample points inside the CB for the firework reel (src/hotel-film/firework/cb-sparks.json).

The CB is placed as in the pins reel (860 wide, centred at 540, 930 on 1080 x 1920). Make
the mask with headless Chromium (no SVG rasteriser here), the CB white on black:

  <img src="file:///.../public/brand/cbh-logo-cb-only.svg" style="position:absolute;
   left:-10.153px;top:465.538px;width:1099.175px;height:1349.027px;
   filter:brightness(0) invert(1)">
  chromium --headless --window-size=1080,1920 --screenshot=cb.png cb.html

A firework shape reads by its outline, so the edge gets sparks close together and the
inside of the strokes a sparser fill. Points are kept apart (a dart-throwing Poisson
disc), so the sparks never clump.

The magnet reel's filings (cb-filings.json) are the same sampling, denser, filling the
strokes right up to the edge, each with the direction of the stroke at that point (the
smoothed distance-to-edge field's gradient turned a quarter turn), which the filings
lie along as they lock together:
  cb.png src/hotel-film/magnet/cb-filings.json 11 13 4 tangent

Usage: python3 scripts/cb-points.py cb.png [out.json] [edge spacing] [fill spacing] [inset]
"""

import json
import sys

import numpy as np
from PIL import Image
from scipy.ndimage import binary_erosion, distance_transform_edt, gaussian_filter

rng = np.random.default_rng(3)
args = sys.argv[1:] + [None] * 6
EDGE, FILL, INSET = float(args[2] or 15), float(args[3] or 28), int(args[4] or 12)
mask = np.array(Image.open(args[0]).convert("L"))[:1800] > 128
edge = mask & ~binary_erosion(mask, iterations=3)
inner = binary_erosion(mask, iterations=INSET)


def disc(cand, spacing, taken):
    """Dart throwing, the neighbours found through a grid of spacing-sized cells."""
    grid = {}

    def add(x, y):
        grid.setdefault((int(x // spacing), int(y // spacing)), []).append((x, y))

    def free(x, y):
        cx, cy = int(x // spacing), int(y // spacing)
        return all(
            (x - a) ** 2 + (y - b) ** 2 >= spacing**2
            for i in (-1, 0, 1)
            for j in (-1, 0, 1)
            for a, b in grid.get((cx + i, cy + j), ())
        )

    for x, y in taken:
        add(x, y)
    out = []
    for x, y in cand[rng.permutation(len(cand))]:
        if free(x, y):
            out.append((x, y))
            add(x, y)
    return out


ey, ex = np.nonzero(edge)
edges = disc(np.stack([ex, ey], 1), EDGE, [])
iy, ix = np.nonzero(inner)
fill = disc(np.stack([ix, iy], 1), FILL, edges)
pts = [[int(x), int(y), 1] for x, y in edges] + [[int(x), int(y), 0] for x, y in fill]
if args[5] == "tangent":
    field = gaussian_filter(distance_transform_edt(mask), 6)
    gy, gx = np.gradient(field)
    for p in pts:
        x, y = p[0], p[1]
        p.append(round(float(np.arctan2(gy[y, x], gx[y, x]) + np.pi / 2), 3))
out = args[1] or "src/hotel-film/firework/cb-sparks.json"
json.dump(pts, open(out, "w"), separators=(",", ":"))
print(len(edges), "edge,", len(fill), "fill ->", out)
