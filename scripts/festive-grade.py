#!/usr/bin/env python3
"""One shared grade for the festive stills, so the hotels read as one film.

Each still is pulled halfway towards a common warm white balance and a common exposure
(interiors brighter, night exteriors kept dark but not crushed), then every still gets the
same finishing curve: a gentle S-curve and a touch less saturation.
Usage: scripts/festive-grade.py <in.jpg> <out.jpg> [--night]
"""
import sys
import numpy as np
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
night = "--night" in sys.argv
a = np.asarray(Image.open(src).convert("RGB")).astype(np.float64) / 255

WARMTH = 0.12  # target mean R - B
LUM = 0.30 if night else 0.44  # target mean luminance
PULL = 0.5  # how far towards the targets

lum = lambda x: 0.2126 * x[..., 0] + 0.7152 * x[..., 1] + 0.0722 * x[..., 2]
m = a.reshape(-1, 3).mean(0)
dw = (WARMTH - (m[0] - m[2])) * PULL  # warm or cool the balance
a[..., 0] *= 1 + dw / (2 * max(m[0], 1e-3))
a[..., 2] *= 1 - dw / (2 * max(m[2], 1e-3))
gain = 1 + (LUM / max(lum(a).mean(), 1e-3) - 1) * PULL
a = np.clip(a * gain, 0, 1)
# finishing curve: gentle S around the mid-tones, then a touch less saturation
a = a + 0.08 * np.sin(2 * np.pi * (a - 0.5)) * -0.5 * (1 - np.abs(2 * a - 1))
y = lum(a)[..., None]
a = np.clip(y + (a - y) * 0.92, 0, 1)
Image.fromarray((a * 255 + 0.5).astype(np.uint8)).save(dst, quality=93)
