#!/usr/bin/env python3
"""Render a still as a "sketch then watercolour" clip for the sketch reel.

The shot starts as a blank sheet of cream paper. Pencil lines draw themselves on (clean
outlines first, then light hatching for the shading, sweeping across the page with a little randomness so it
reads as a hand at work); then the colour floods in from `--origin` like a watercolour wash
(a soft, blobby front with a faint pigment tide-line), the pencil fading as the colour
passes, until the frame is the photo itself. A gentle push-in (1.00 -> `--z1`) runs across
the whole clip. Pillow LANCZOS crops per frame (as kenburns.py), piped to ffmpeg.

Usage: scripts/sketch-wash.py photo.jpg out.mp4 --cx 960 [--cy 540 --h 1080]
         --frames 87 --draw 0 34 --wash 30 66 [--origin 0.5 0.6] [--z1 1.04] [--seed 1]
"""

import argparse
import subprocess

import numpy as np
from PIL import Image, ImageFilter

W, H = 1080, 1920
p = argparse.ArgumentParser()
p.add_argument("photo")
p.add_argument("out")
p.add_argument("--cx", type=float, required=True)
p.add_argument("--cy", type=float)
p.add_argument("--h", type=float)
p.add_argument("--frames", type=int, required=True)
p.add_argument("--draw", type=int, nargs=2, required=True, help="first and last frame of the drawing")
p.add_argument("--wash", type=int, nargs=2, required=True, help="first and last frame of the wash")
p.add_argument("--origin", type=float, nargs=2, default=[0.5, 0.6], help="where the colour starts (0-1)")
p.add_argument("--z1", type=float, default=1.04)
p.add_argument("--seed", type=int, default=1)
a = p.parse_args()

src = Image.open(a.photo).convert("RGB")
sw, sh = src.size
ch = a.h or sh
cw = ch * W / H
cy = a.cy if a.cy is not None else sh / 2
# Render at 1.1x the final size so the push-in never runs out of pixels.
M = 1.1
box = (a.cx - cw / 2, cy - ch / 2, a.cx + cw / 2, cy + ch / 2)
photo_img = src.resize((int(W * M), int(H * M)), Image.LANCZOS, box=box)
# A gentle unsharp mask: web-sized stills are enlarged for 9:16 and read soft otherwise.
photo_img = photo_img.filter(ImageFilter.UnsharpMask(radius=2.2, percent=70, threshold=2))
photo = np.asarray(photo_img).astype(np.float32) / 255
HH, WW = photo.shape[:2]
rng = np.random.default_rng(a.seed)


def blur(arr, r):
    img = Image.fromarray(np.clip(arr * 255, 0, 255).astype(np.uint8))
    return np.asarray(img.filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255


def noise(cells_x, cells_y, seed):
    r = np.random.default_rng(seed).random((cells_y, cells_x))
    img = Image.fromarray((r * 255).astype(np.uint8)).resize((WW, HH), Image.BICUBIC)
    return np.asarray(img).astype(np.float32) / 255


# --- The drawing, as a hand would: clean outlines (an XDoG-style soft threshold of a
# difference of Gaussians on a smoothed image, isolated specks opened away) and the shading
# as light pencil hatching in three tones, with a slight wobble; no photocopy speckle.
gray = np.asarray(photo_img.convert("L").filter(ImageFilter.MedianFilter(7))).astype(np.float32) / 255
gs = blur(gray, 1.4)
dog = blur(gs, 1.0) - 0.97 * blur(gs, 2.6)
line = np.clip(1 - (1 + np.tanh(90 * (dog - 0.004))), 0, 1)
opened_img = Image.fromarray((line * 255).astype(np.uint8))
opened_img = opened_img.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
opened = np.asarray(opened_img).astype(np.float32) / 255
outline = blur(np.maximum(opened * 0.95, line * (blur(opened, 3) > 0.08)), 0.6)
tone = blur(1 - gs, 7)
yy, xx = np.mgrid[0:HH, 0:WW].astype(np.float32)
wob = (blur(np.random.default_rng(a.seed + 2).random((HH, WW)).astype(np.float32), 18) - 0.5) * 40


def hatch(angle, space, width):
    r = np.deg2rad(angle)
    u = xx * np.cos(r) + yy * np.sin(r) + wob
    return (np.mod(u, space) < width).astype(np.float32)


hatching = (
    hatch(45, 11, 1.6) * (tone > 0.5)
    + hatch(-45, 11, 1.4) * (tone > 0.64)
    + hatch(45, 5.5, 1.2) * (tone > 0.78)
)
hatching = np.clip(blur(hatching, 0.5) * 1.2, 0, 1)
lines = np.clip(np.maximum(outline, hatching * 0.32), 0, 1)

# The order each mark is drawn in: outlines before shading, a diagonal sweep across the
# page, and blobby randomness so strokes arrive in patches, like a hand moving about.
sweep = (xx / WW * 0.55 + yy / HH * 0.45)
edge = blur(outline, 2.0)
order = 0.45 * sweep + 0.3 * (1 - np.clip(edge * 2, 0, 1)) + 0.25 * noise(18, 32, a.seed + 3)
order = (order - order.min()) / (order.max() - order.min())

# --- The paper: warm cream with a soft fibre texture and a faint vignette.
paper = np.array([0.953, 0.925, 0.871], np.float32)
fibre = noise(240, 420, a.seed + 11) * 0.5 + noise(60, 100, a.seed + 12) * 0.5
vig = 1 - 0.07 * (((xx / WW - 0.5) ** 2 + (yy / HH - 0.5) ** 2) * 2.2)
paper_img = paper[None, None, :] * (0.965 + 0.05 * fibre)[..., None] * vig[..., None]
graphite = np.array([0.22, 0.2, 0.18], np.float32)

# --- The wash: distance from the origin, broken up by large blobs and fine grain.
ox, oy = a.origin[0] * WW, a.origin[1] * HH
dist = np.hypot((xx - ox) / WW, (yy - oy) / HH * (HH / WW) * 0.62)
dist = dist / dist.max()
dist = dist + (noise(7, 12, a.seed + 5) - 0.5) * 0.32 + (noise(40, 70, a.seed + 6) - 0.5) * 0.06
# never below zero: near the origin the noise could pull it under the wash's starting front, so a
# speck of the photo showed through on the blank page from the first frame (Scott: "starts with a smudge")
dist = np.maximum(dist, 0.0)


def smooth(t):
    t = min(1.0, max(0.0, t))
    return t * t * (3 - 2 * t)


def ease_out(t):
    t = min(1.0, max(0.0, t))
    return 1 - (1 - t) ** 3


ff = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
     "-r", "30", "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "16",
     "-pix_fmt", "yuv420p", "-movflags", "+faststart", a.out],
    stdin=subprocess.PIPE,
)
d0, d1 = a.draw
w0, w1 = a.wash
for f in range(a.frames):
    s = smooth((f - d0) / max(1, d1 - d0)) * 1.1
    drawn = np.clip((s - order) / 0.07, 0, 1)
    w = smooth((f - w0) / max(1, w1 - w0))
    front = w * 1.35 - 0.12
    m = np.clip((front - dist) / 0.05, 0, 1)
    # Pigment gathers at the drying edge; the freshly wet colour is a touch paler.
    ring = np.clip(1 - np.abs(front - dist - 0.03) / 0.03, 0, 1) * (0 < w < 1)
    wet = np.clip(1 - (front - dist) / 0.18, 0, 1) * m
    colour = photo * (1 - 0.22 * wet[..., None]) + paper_img * (0.22 * wet[..., None])
    colour = colour * (1 - 0.18 * ring[..., None])
    base = paper_img * (1 - m[..., None]) + colour * m[..., None]
    # The pencil fades as the colour passes over it, and is gone once the wash has dried.
    gone = smooth((f - (w1 - 6)) / 10)
    alpha = lines * drawn * (1 - 0.8 * m) * (1 - gone)
    out = base * (1 - alpha[..., None]) + graphite * alpha[..., None]
    img = Image.fromarray(np.clip(out * 255, 0, 255).astype(np.uint8))
    # The push-in: from the central 1/M of the oversized frame to 1/(M * z1).
    z = 1 + (a.z1 - 1) * f / max(1, a.frames - 1)
    vw, vh = WW / (M * z), HH / (M * z)
    crop = ((WW - vw) / 2, (HH - vh) / 2, (WW + vw) / 2, (HH + vh) / 2)
    ff.stdin.write(img.resize((W, H), Image.LANCZOS, box=crop).tobytes())
ff.stdin.close()
ff.wait()
print(f"wrote {a.out} ({a.frames} frames)")
