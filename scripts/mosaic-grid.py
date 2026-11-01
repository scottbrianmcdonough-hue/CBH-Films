#!/usr/bin/env python3
"""Build the photomosaic for the mosaic reel (cbh-mosaic): an atlas of square tiles cut from
the collection's photos (public/mosaic/atlas.jpg) and the wall (src/hotel-film/mosaic/grid.ts):
which tile sits in each cell and how much of the cell the CB covers, so the wall can resolve
into the monogram.

So the same picture doesn't keep showing (Scott: "I can see all the same photos everywhere"):
near-duplicate photos are dropped; each photo gives up to four different tiles (a centre
crop, its two ends along the long side, a closer detail), so a repeat shows another part of
it; and no photo sits within SPACING cells of itself. Bright, warm tiles go inside the CB,
the rest outside.

Usage: scripts/mosaic-grid.py   (reads MOSAIC_PHOTOS from src/hotel-film/mosaic/photos.ts)
       scripts/mosaic-grid.py --name foodie --photos src/hotel-film/mosaic/photos-foodie.ts \
           --hero <photo> --beside <photo>   (a variant: public/mosaic/atlas-foodie.jpg and
           src/hotel-film/mosaic/grid-foodie.ts)
"""
import argparse
import json
import re

import numpy as np
from PIL import Image, ImageChops, ImageDraw
from svgpathtools import svg2paths

ROOT = __file__.rsplit("/scripts/", 1)[0]
COLS, ROWS, T = 40, 70, 34  # cells, and a cell's size in world px (room to spare round the frame while the wall holds)
CB_W = 960  # the CB's width on the wall, world px
CB_BOX = (58.4, 0.0, 476.4, 451.5)  # the CB's bounds in the logo's viewBox
CB_CY = ROWS * T / 2  # the CB's centre sits in the middle of the wall
ATLAS_TILE, ATLAS_COLS = 208, 21
SPACING = 4  # no photo within this many cells of itself (Chebyshev)
ap = argparse.ArgumentParser()
ap.add_argument("--name", default="")
ap.add_argument("--photos", default="src/hotel-film/mosaic/photos.ts")
# the first tile, filling the frame at the start, and the one just above it, seen large early
ap.add_argument("--hero", default="hotels/castle-inn/garden-fells.jpg")
ap.add_argument("--beside", default="hotels/waterton-park/aerial.jpg")  # Scott
ap.add_argument("--details", type=int, default=1, help="close detail crops per photo (more for a small set)")
args = ap.parse_args()
HERO, BESIDE = args.hero, args.beside
SUFFIX = f"-{args.name}" if args.name else ""
START_AT = (330, 300)  # the first tile sits in the B's stem, near here in the logo's viewBox

photos = re.findall(r'"([^"]+\.(?:jpg|jpeg|png|webp))"', open(f"{ROOT}/{args.photos}").read())


def dhash(im):
    g = np.asarray(im.convert("L").resize((17, 16), Image.LANCZOS), dtype=np.int16)
    return (g[:, 1:] > g[:, :-1]).flatten()


# drop near-duplicates (the same shot kept in two campaign folders)
kept, hashes, sizes = [], [], []
for p in photos:
    im = Image.open(f"{ROOT}/public/{p}").convert("RGB")
    s = min(im.size)
    h = dhash(im.crop(((im.width - s) // 2, (im.height - s) // 2, (im.width + s) // 2, (im.height + s) // 2)))
    if any((h != o).sum() < 40 for o in hashes):
        print("duplicate, dropped:", p)
        continue
    kept.append(p)
    hashes.append(h)
    sizes.append(im.size)
photos = kept

# tiles: square crops as fractions of each photo (x, y, side), the centre crop first
variants = []  # [photo, x, y, side] in source px
for i, (w, h) in enumerate(sizes):
    s = min(w, h)
    crops = [((w - s) / 2, (h - s) / 2, s)]
    if max(w, h) / s > 1.3:  # landscape or portrait: the two ends of the long side
        if w > h:
            crops += [(0, 0, s), (w - s, 0, s)]
        else:
            crops += [(0, 0, s), (0, h - s, s)]
    d = s * 0.62  # a closer detail, a little off-centre
    crops.append((w / 2 - d * 0.42, h / 2 - d * 0.55, d))
    # more details, each in a different corner of the middle, for a small set
    for fx, fy in [(-0.75, -0.35), (-0.25, -0.75), (-0.62, -0.62)][: args.details - 1]:
        crops.append((w / 2 + d * fx, h / 2 + d * fy, d))
    variants += [[i, round(x), round(y), round(c)] for x, y, c in crops]

atlas_rows = (len(variants) + ATLAS_COLS - 1) // ATLAS_COLS
atlas = Image.new("RGB", (ATLAS_TILE * ATLAS_COLS, ATLAS_TILE * atlas_rows))
score = []
cache = {}
for v, (i, x, y, c) in enumerate(variants):
    if i not in cache:
        cache = {i: Image.open(f"{ROOT}/public/{photos[i]}").convert("RGB")}
    t = cache[i].crop((x, y, x + c, y + c)).resize((ATLAS_TILE, ATLAS_TILE), Image.LANCZOS)
    atlas.paste(t, ((v % ATLAS_COLS) * ATLAS_TILE, (v // ATLAS_COLS) * ATLAS_TILE))
    a = np.asarray(t, dtype=np.float32) / 255
    score.append(a.mean() + 0.6 * (a[..., 0] - a[..., 2]).mean())
atlas.save(f"{ROOT}/public/mosaic/atlas{SUFFIX}.jpg", quality=86)

# the CB rasterised onto the wall (subpaths XORed, so the counters stay open)
k = CB_W / (CB_BOX[2] - CB_BOX[0])
ox = COLS * T / 2 - (CB_BOX[0] + CB_BOX[2]) / 2 * k
oy = CB_CY - (CB_BOX[1] + CB_BOX[3]) / 2 * k
SS = 4
mask = Image.new("1", (COLS * T * SS, ROWS * T * SS), 0)
paths, _ = svg2paths(f"{ROOT}/public/brand/cbh-logo-cb-only.svg")
for path in paths:
    for sub in path.continuous_subpaths():
        pts = [sub.point(t) for t in np.linspace(0, 1, 1500)]
        layer = Image.new("1", mask.size, 0)
        ImageDraw.Draw(layer).polygon([((z.real * k + ox) * SS, (z.imag * k + oy) * SS) for z in pts], fill=1)
        mask = ImageChops.logical_xor(mask, layer)
m = np.asarray(mask, dtype=np.float32).reshape(ROWS, T * SS, COLS, T * SS).mean(axis=(1, 3))

# Two walls. The first (CELLS_PRE) is what the camera pulls back to: a mix of every tile, no
# hint of the CB, the first tile and Waterton's aerial set in it. The second (CELLS) is what
# each tile turns over to as the wave passes (Scott: "just one shuffle each, like a ripple
# that creates the CB"): the brightest third inside the CB, the rest outside, never the tile
# it turns over from. In both, each pick is the least-used tile whose photo isn't within
# SPACING cells.
order = list(np.argsort(score)[::-1])
cut = len(order) // 3
pools = {True: order[:cut], False: order[cut:]}
rng = np.random.default_rng(7)
inside = [(r, c) for r in range(ROWS) for c in range(COLS) if m[r, c] >= 1]
tx, ty = ox + START_AT[0] * k, oy + START_AT[1] * k
sr, sc_ = min(inside, key=lambda rc: ((rc[1] + 0.5) * T - tx) ** 2 + ((rc[0] + 0.5) * T - ty) ** 2)
START = sr * COLS + sc_


def build(pool_for, presets, avoid=None):
    used = np.zeros(len(variants), dtype=int)
    cells = -np.ones((ROWS, COLS), dtype=int)
    photo_at = -np.ones((ROWS, COLS), dtype=int)
    for (r, c), name in presets:
        v = next(i for i, var in enumerate(variants) if photos[var[0]] == name)  # its centre crop
        cells[r, c], photo_at[r, c] = v, variants[v][0]
        used[v] += 1
    for r in range(ROWS):
        for c in range(COLS):
            if cells[r, c] >= 0:
                continue
            near = set(photo_at[max(0, r - SPACING): r + SPACING + 1, max(0, c - SPACING): c + SPACING + 1].flatten())
            if avoid is not None:
                near.add(variants[avoid[r, c]][0])
            pool = pool_for(r, c)
            ok = [v for v in pool if variants[v][0] not in near] or pool
            least = min(used[v] for v in ok)
            pick = rng.choice([v for v in ok if used[v] == least])
            cells[r, c], photo_at[r, c] = pick, variants[pick][0]
            used[pick] += 1
    return cells, used


pre, used_pre = build(lambda r, c: order, [((sr, sc_), HERO), ((sr - 1, sc_), BESIDE)])
cells, used = build(lambda r, c: pools[bool(m[r, c] > 0.5)], [], avoid=pre)

with open(f"{ROOT}/src/hotel-film/mosaic/grid{SUFFIX}.ts", "w") as f:
    f.write("// Generated by scripts/mosaic-grid.py: do not edit by hand.\n")
    f.write(f"export const COLS = {COLS};\nexport const ROWS = {ROWS};\nexport const T = {T};\n")
    f.write(f"export const CB_K = {k:.5f}; // world px per logo viewBox unit\n")
    f.write(f"export const CB_O: [number, number] = [{ox:.2f}, {oy:.2f}]; // the viewBox origin on the wall\n")
    f.write(f"export const START = {START}; // the first tile (cell index)\n")
    f.write(f"export const ATLAS_TILE = {ATLAS_TILE};\nexport const ATLAS_COLS = {ATLAS_COLS};\n")
    f.write(f"export const ATLAS_SIZE: [number, number] = [{atlas.width}, {atlas.height}];\n")
    f.write(f"export const PHOTOS = {json.dumps(photos)};\n")
    f.write(f"export const PHOTO_SIZES: [number, number][] = {json.dumps([list(s) for s in sizes])};\n")
    f.write("// each tile in the atlas: [photo, x, y, side] of its square crop, source px\n")
    f.write(f"export const VARIANTS: [number, number, number, number][] = {json.dumps(variants)};\n")
    f.write(f"// the wall the camera pulls back to, tile per cell, row by row\nexport const CELLS_PRE = {json.dumps(pre.flatten().tolist())};\n")
    f.write(f"// the wall each tile turns over to\nexport const CELLS = {json.dumps(cells.flatten().tolist())};\n")
    f.write(f"// how much of each cell the CB covers, 0..1\nexport const COVER = {json.dumps([round(float(v), 2) for v in m.flatten()])};\n")
    f.write(f'export const ATLAS = "mosaic/atlas{SUFFIX}.jpg";\n')
    f.write("// the whole wall, for the component\nexport const GRID = { COLS, ROWS, T, CB_K, CB_O, START, ATLAS, "
            "ATLAS_TILE, ATLAS_COLS, ATLAS_SIZE, PHOTOS, PHOTO_SIZES, VARIANTS, CELLS_PRE, CELLS, COVER };\n")
print(f"{len(photos)} photos, {len(variants)} tiles, {int((m > 0.5).sum())} of {COLS * ROWS} cells inside the CB, "
      f"each tile used {used_pre.min()}-{used_pre.max()} times before the wave, {used.min()}-{used.max()} after")
