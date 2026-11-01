"""Re-flow Lily's handwritten words onto lines `maxw` source px wide; writes blurb-lines-<i>.png (RGBA,
ink near-black), each line image's baseline at a fixed offset (70 source px from the top)."""
import sys
import numpy as np
from PIL import Image
S = 3
maxw = float(sys.argv[1]) * S
z = np.load("blurb-words.npz")
meta = [tuple(map(int, l.split())) for l in open("blurb-words.txt").read().splitlines()]
ws = [(*meta[i], z[f"arr_{i}"]) for i in range(len(meta))]
# glue punctuation (narrow runs) to the word before it, keeping her own spacing
tokens = []
for (li, x0, x1, a) in ws:
    if tokens and x1 - x0 < 16 * S and tokens[-1][0] == li:
        pli, px0, px1, pa = tokens[-1]
        h = pa.shape[0]
        merged = np.zeros((h, x1 - px0)); merged[:, : px1 - px0] = pa; merged[:, x0 - px0:] = np.maximum(merged[:, x0 - px0:], a)
        tokens[-1] = (li, px0, x1, merged)
    else:
        tokens.append((li, x0, x1, a))
space = 24 * S
lines, cur, w = [], [], 0
for t in tokens:
    tw = t[3].shape[1]
    if cur and w + space + tw > maxw:
        lines.append(cur); cur, w = [], 0
    w += (space if cur else 0) + tw
    cur.append(t)
lines.append(cur)
for i, ln in enumerate(lines):
    h = ln[0][3].shape[0]
    tot = sum(t[3].shape[1] for t in ln) + space * (len(ln) - 1)
    canvas = np.zeros((h, tot)); x = 0
    for t in ln:
        canvas[:, x : x + t[3].shape[1]] = np.maximum(canvas[:, x : x + t[3].shape[1]], t[3]); x += t[3].shape[1] + space
    rgba = np.zeros((h, tot, 4), np.uint8); rgba[..., :3] = 22; rgba[..., 3] = (canvas * 255).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(f"blurb-line-{i}.png")
print(len(lines), "lines")
