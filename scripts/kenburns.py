#!/usr/bin/env python3
"""Render a still as a Ken Burns clip: Pillow LANCZOS, frame by frame, subpixel crops.

Each frame takes a float crop box from the source (a 9:16 window around the crop centre,
shrinking linearly with the zoom and drifting a little in one direction) and resamples it
straight to 1080x1920 with LANCZOS, so the move is smooth with no integer-pixel stepping
(unlike ffmpeg zoompan). Frames are piped to ffmpeg as raw RGB and encoded near-lossless.

Usage: scripts/kenburns.py <src.jpg> <out.mp4> --cx 900 [--cy 640] [--h 1275]
       [--frames 64] [--z0 1.04] [--z1 1.12] [--over 60] [--drift -12]
  --over   frames over which the zoom goes z0 -> z1 (the rate continues past it)
  --drift  horizontal travel of the crop centre over --over frames, in source pixels
           (negative = the window moves left, so the picture drifts right)
"""
import argparse
import subprocess

from PIL import Image

W, H, FPS = 1080, 1920, 30

ap = argparse.ArgumentParser()
ap.add_argument("src")
ap.add_argument("out")
ap.add_argument("--cx", type=float, required=True)
ap.add_argument("--cy", type=float)
ap.add_argument("--h", type=float)
ap.add_argument("--frames", type=int, default=64)
ap.add_argument("--z0", type=float, default=1.04)
ap.add_argument("--z1", type=float, default=1.12)
ap.add_argument("--over", type=float, default=60)
ap.add_argument("--drift", type=float, default=-12)
a = ap.parse_args()

im = Image.open(a.src).convert("RGB")
sw, sh = im.size
ch0 = a.h or sh
cy = a.cy if a.cy is not None else sh / 2

enc = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
     "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
     "-c:v", "libx264", "-preset", "slow", "-crf", "10", "-pix_fmt", "yuv420p",
     "-movflags", "+faststart", a.out],
    stdin=subprocess.PIPE,
)
for f in range(a.frames):
    t = f / a.over
    z = a.z0 + (a.z1 - a.z0) * t
    ch = ch0 / z
    cw = ch * W / H
    x = a.cx + a.drift * t
    # Keep the window inside the photo.
    x = min(max(x, cw / 2), sw - cw / 2)
    y = min(max(cy, ch / 2), sh - ch / 2)
    box = (x - cw / 2, y - ch / 2, x + cw / 2, y + ch / 2)
    frame = im.resize((W, H), Image.LANCZOS, box=box)
    enc.stdin.write(frame.tobytes())
enc.stdin.close()
if enc.wait():
    raise SystemExit("ffmpeg failed")
print(f"{a.out}: {a.frames} frames, zoom {a.z0}->{a.z0 + (a.z1 - a.z0) * (a.frames - 1) / a.over:.3f}")
