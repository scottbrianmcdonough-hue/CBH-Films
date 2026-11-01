#!/usr/bin/env python3
"""Dark, moody grade for a still (Hotels with a History): a night-ish look from daylight
photos without crushing them.

Blues (daylight skies) lose most of their colour and darken towards a stormy slate; the
rest is pulled down and half-desaturated, shadows lean cool, warm lights (lit windows,
fires) keep a little glow, and the top of the frame is graduated darker. Used by
scripts/kenburns.py --grade, or standalone to preview: moody-grade.py <in> <out> [--mix 0.6].
"""
import argparse

import numpy as np
from PIL import Image


def grade(im: Image.Image, mix: float = 1.0) -> Image.Image:
    """mix < 1 blends back towards the original (for shots already taken at night)."""
    a = np.asarray(im.convert("RGB")).astype(np.float32) / 255.0
    a0 = a
    h, w, _ = a.shape
    lum = a @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # How "sky blue" each pixel is: blue over red and green.
    blue = np.clip((b - np.maximum(r, g)) * 4.0, 0, 1)
    # Warm lights: bright and red-dominant.
    warm = np.clip((r - b) * 3.0, 0, 1) * np.clip((lum - 0.45) * 3.0, 0, 1)
    # Greens (sunlit lawns and trees) read as daytime: they lose more colour too.
    green = np.clip((g - np.maximum(r, b)) * 4.0, 0, 1)
    sat = 0.4 - 0.3 * blue - 0.15 * green + 0.35 * warm  # keep fraction of the colour
    a = lum[..., None] + (a - lum[..., None]) * sat[..., None]
    # Exposure and a darkening curve: mids down, highlights held a little.
    a = np.clip(a * (0.74 - 0.2 * blue[..., None] - 0.1 * green[..., None]), 0, 1)
    a = a ** (1.55 - 0.45 * warm[..., None])
    # Split tone: cool slate shadows, a faint warmth in the lights.
    l2 = (a @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32))[..., None]
    shadow = (1 - l2) ** 2
    a = a + shadow * np.array([-0.018, 0.0, 0.03], dtype=np.float32)
    a = a + (l2**2) * np.array([0.02, 0.008, -0.02], dtype=np.float32)
    # Graduated darkening from the top (a stormy sky), and a soft vignette.
    y = np.linspace(0, 1, h, dtype=np.float32)[:, None]
    x = np.linspace(-1, 1, w, dtype=np.float32)[None, :]
    top = 1 - 0.35 * np.clip(1 - y / 0.55, 0, 1) ** 1.5
    vig = 1 - 0.28 * np.clip(x**2 * 0.6 + ((y - 0.5) * 2) ** 2 * 0.25, 0, 1)
    a = a * (top * vig)[..., None]
    a = a0 + (a - a0) * mix
    return Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("out")
    ap.add_argument("--mix", type=float, default=1.0)
    a = ap.parse_args()
    grade(Image.open(a.src), a.mix).save(a.out, quality=92)
