"""Lift Lily's handwritten blurb off her photo: ink only (her pen is far darker than the rules), the
crossed-out "sat" taken out, her words cut apart so they can be re-flowed onto the cover's lines.
Also lifts the panda and fern stamp. Writes blurb-words.npz and stamp.png."""
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
S = 3
src = Image.open("blurb-src.png").convert("RGB")
big = src.resize((src.width * S, src.height * S), Image.LANCZOS)
g = np.asarray(big.convert("L").filter(ImageFilter.GaussianBlur(0.8))).astype(float)
H, W = g.shape
RULES = [91, 148, 205, 262, 320, 379]  # her baselines (source px)
ink = g < 92
ink[int(392 * S):, :] = False
# the y of "psychopath" loops down onto the d of "told": part them where they touch
ink[174 * S : 174 * S + 2, 70 * S : 112 * S] = False
lab, n = ndi.label(ink)
sizes = ndi.sum(ink, lab, range(1, n + 1))
alpha = np.where(ndi.binary_dilation(ink, iterations=2), np.clip((140 - g) / 80.0, 0, 1), 0)
cents = ndi.center_of_mass(ink, lab, range(1, n + 1))
objs = ndi.find_objects(lab)
words = []  # (line, x0, x1, image)
for li, base in enumerate(RULES):
    m = np.zeros_like(ink)
    for k in range(n):
        if sizes[k] < 40:
            continue
        sl = objs[k]
        y0, y1 = sl[0].start / S, sl[0].stop / S
        x0, x1 = sl[1].start / S, sl[1].stop / S
        # a letter belongs to the line its top sits in (tails hang below into the next line's band)
        if not (base - 62 <= y0 <= base + 2):
            continue
        if li == 2 and 775 <= x0 <= 840:  # the crossed-out "sat"
            continue
        if y1 - y0 <= 3 or (y1 - y0 < 5 and x1 - x0 > 12):  # a scrap of a ruled line
            continue
        if sizes[k] < 300 and y0 < base - 45:  # a speck too high for an i dot or an apostrophe
            continue
        if x0 > 1030 or y1 - y0 > 70:  # the paper's edge and fold
            continue
        m |= lab == k + 1
    region = ndi.binary_dilation(m, iterations=3)
    top, bot = (base - 70) * S, (base + 30) * S
    colp = region[top:bot].any(0)
    xs = np.nonzero(colp)[0]
    # words: runs of columns with ink, split where the gap is wider than ~13 source px
    runs = np.split(xs, np.nonzero(np.diff(xs) > 13 * S)[0] + 1)
    for r in runs:
        if len(r) < 4 * S:
            continue
        x0, x1 = r[0], r[-1] + 1
        a = np.where(region[top:bot, x0:x1], alpha[top:bot, x0:x1], 0)
        words.append((li, x0, x1, a))
print(len(words), "words")
np.savez_compressed("blurb-words.npz", *[w[3] for w in words])
open("blurb-words.txt", "w").write("\n".join(f"{w[0]} {w[1]} {w[2]}" for w in words))
# the panda and fern stamp: anything that isn't paper, colours kept
st = np.asarray(src).astype(float)[398:512, 840:1015]
paper = np.array([196, 202, 214.0])
d = np.sqrt(((st - paper) ** 2).sum(2))
al = np.clip((d - 26) / 40.0, 0, 1)
lab2, n2 = ndi.label(al > 0.2)
sz = ndi.sum(al > 0.2, lab2, range(1, n2 + 1))
k2 = np.zeros(n2 + 1, bool); k2[1:] = sz > 6
al = np.where(ndi.binary_dilation(k2[lab2], iterations=1), al, 0)
rgba = np.dstack([st, al * 255]).astype(np.uint8)
im = Image.fromarray(rgba, "RGBA"); im = im.crop(im.getbbox())
im = im.resize((im.width * S, im.height * S), Image.LANCZOS)
im.save("stamp.png"); print("stamp", im.size)
