#!/usr/bin/env python3
"""The white bed's near layer as a matte (white = in front of the end card's words): the
carved headboard and everything of the bed in front of it, so "Fancy a night / in a castle?"
can rise from behind the headboard's crest and sit over the red curtains (Scott: the line "in
the middle layer in the bedroom"). The crest's outline comes from the photo itself (the cream
carving against the dark red curtain: bright, unsaturated pixels inside a box round the
headboard), with the carving's shadows filled; the rest of the bed is the depth map's blocks.
Writes depth/white-bed-matte.png. Run through still-depth-dolly.py with the bed's own settings
it moves exactly with the picture."""
import os

import numpy as np
from PIL import Image
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
img = np.asarray(Image.open(os.path.join(HERE, "white-bed.jpg")).convert("RGB")).astype(np.float32) / 255
H, W, _ = img.shape
k = W / 1200
mx, mn = img.max(-1), img.min(-1)
r, g, b = img[..., 0], img[..., 1], img[..., 2]
# cream, beige and the gilt tips: bright, and not the curtain's deep red (red far above green)
cream = (mx > 0.42) & (g > 0.62 * r) & (b > 0.38 * r)
box = np.zeros((H, W), bool)
box[int(100 * k):int(470 * k), int(262 * k):int(667 * k)] = True  # to the headboard's right post, short of the curtain cord
head = cream & box
head = nd.binary_closing(head, iterations=9)
head = nd.binary_fill_holes(head)
lab, n = nd.label(head)
if n:
    sizes = nd.sum(head, lab, range(1, n + 1))
    head = lab == (1 + int(np.argmax(sizes)))  # the headboard itself, not stray highlights
depth = np.asarray(Image.open(os.path.join(HERE, "depth", "white-bed.png"))).astype(np.float32) / 255
yy = np.arange(H)[:, None] * np.ones((1, W))
bed = (depth >= 0.42) & (yy > 300 * k)  # the pillows, the footboard and its rail
matte = head | bed
matte = nd.gaussian_filter(matte.astype(np.float32), 1.2)
Image.fromarray((np.clip(matte, 0, 1) * 255).astype(np.uint8)).save(os.path.join(HERE, "depth", "white-bed-matte.png"))
print("depth/white-bed-matte.png")
