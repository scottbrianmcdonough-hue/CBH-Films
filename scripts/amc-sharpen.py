#!/usr/bin/env python3
"""Sharpen the AMC film's soft phone stills (Scott, 26 Oct: "sharpen any other soft photos").

Low-light phone shots and frames pulled from phone video carry a little blur and a lot of noise,
so a plain unsharp mask turns the noise crunchy. On brightness only (colour left alone): a light
denoise, a few Richardson-Lucy iterations against a small Gaussian blur (it puts back edges the
blur spread out), then a fine unsharp mask; a mask keeps the flat areas (walls, skin, sky) from
gaining grain. Writes <name>-sharp.jpg next to each source; the films point at those.

Usage: scripts/amc-sharpen.py <file> [<file> ...]   (paths under public/campaigns/amc-2026/)
       SIGMA=1.1 ITER=8 AMOUNT=0.6 to tune.
"""
import os
import sys

import cv2
import numpy as np
from skimage.restoration import richardson_lucy

SIGMA = float(os.environ.get("SIGMA", 1.1))  # the blur being undone, in pixels
ITER = int(os.environ.get("ITER", 8))
AMOUNT = float(os.environ.get("AMOUNT", 0.6))  # the fine unsharp mask on top


def psf(sigma):
    r = int(np.ceil(sigma * 3))
    x = np.arange(-r, r + 1)
    g = np.exp(-(x**2) / (2 * sigma**2))
    k = np.outer(g, g)
    return k / k.sum()


def sharpen(bgr):
    ycc = cv2.cvtColor(bgr, cv2.COLOR_BGR2YCrCb)
    y = ycc[:, :, 0]
    # light denoise first, so the deblur sharpens edges rather than grain
    y_dn = cv2.fastNlMeansDenoising(y, None, h=4, templateWindowSize=7, searchWindowSize=21)
    yf = y_dn.astype(np.float64) / 255.0
    rl = richardson_lucy(yf, psf(SIGMA), num_iter=ITER, clip=True)
    blur = cv2.GaussianBlur(rl, (0, 0), 0.9)
    us = np.clip(rl + AMOUNT * (rl - blur), 0, 1)
    # only where there is detail: edges take the sharpened value, flat areas keep the denoised one
    gx = cv2.Sobel(yf, cv2.CV_64F, 1, 0, ksize=3)
    gy = cv2.Sobel(yf, cv2.CV_64F, 0, 1, ksize=3)
    mag = cv2.GaussianBlur(np.hypot(gx, gy), (0, 0), 1.5)
    m = np.clip((mag - 0.02) / 0.08, 0, 1)
    out = m * us + (1 - m) * (0.6 * yf + 0.4 * us)
    ycc[:, :, 0] = np.clip(out * 255 + 0.5, 0, 255).astype(np.uint8)
    return cv2.cvtColor(ycc, cv2.COLOR_YCrCb2BGR)


for path in sys.argv[1:]:
    img = cv2.imread(path, cv2.IMREAD_COLOR)
    if img is None:
        sys.exit(f"cannot read {path}")
    base, _ = os.path.splitext(path)
    dst = base + "-sharp.jpg"
    cv2.imwrite(dst, sharpen(img), [cv2.IMWRITE_JPEG_QUALITY, 93])
    print(dst)
