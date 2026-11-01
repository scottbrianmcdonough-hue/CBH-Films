#!/usr/bin/env python3
"""Extend a plate photo whose rim runs to (or just off) its edge, for the circle sting
(cbh-circle-c): each plate is lit in darkness out to 1.28x its rim, so the photo has to
reach that far. Mirrors the photo out by --pad px on every side and blurs the added strip,
so it reads as soft table, not a copy.

Usage: scripts/plate-pad.py <in.jpg> <out.jpg> --pad 160
"""
import argparse

import numpy as np
from PIL import Image, ImageFilter

ap = argparse.ArgumentParser()
ap.add_argument("src")
ap.add_argument("out")
ap.add_argument("--pad", type=int, default=160)
args = ap.parse_args()

im = Image.open(args.src).convert("RGB")
a = np.asarray(im)
p = args.pad
big = Image.fromarray(np.pad(a, ((p, p), (p, p), (0, 0)), mode="reflect"))
soft = big.filter(ImageFilter.GaussianBlur(18))
# the photo itself kept sharp, feathered into the blurred strip over 24px
mask = Image.new("L", big.size, 0)
mask.paste(255, (p, p, p + im.width, p + im.height))
mask = mask.filter(ImageFilter.GaussianBlur(8))
Image.composite(big, soft, mask).save(args.out, quality=92)
print(f"{args.out}: {big.size}, offset {p}px (add it to the rim's centre)")
