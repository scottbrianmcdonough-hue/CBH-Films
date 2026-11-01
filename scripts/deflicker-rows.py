#!/usr/bin/env python3
"""Remove mains-light flicker from phone footage, including rolling bands.

Under 50Hz mains, lights pulse at 100Hz; a 30fps phone shutter aliases that to a 10Hz
flutter (a 3-frame cycle), and its rolling shutter smears it into bands along the sensor
rows, so a global brightness fix (ffmpeg deflicker) leaves the bands. This works per row:
for each frame it takes the brightness profile down the sensor rows (smoothed a little
across rows), compares it with the 3-frame average of that profile (which cancels a 3-frame
cycle), and scales each row by the ratio. Only brightness changes, row by row, so detail
isn't softened. Gains are clamped to +/-15%.

The clip is read in its stored (sensor) orientation and written out rotated upright,
scaled to 1080x1920, H.264, without audio.

Usage: scripts/deflicker-rows.py <in.mov> <out.mp4> [--transpose clock|cclock]
"""
import argparse
import json
import subprocess

import numpy as np
from scipy.ndimage import gaussian_filter1d

ap = argparse.ArgumentParser()
ap.add_argument("src")
ap.add_argument("out")
ap.add_argument("--transpose", default="clock", choices=["clock", "cclock"])
a = ap.parse_args()

info = json.loads(subprocess.check_output(
    ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
     "stream=width,height", "-of", "json", a.src]))["streams"][0]
W, H = info["width"], info["height"]


def frames():
    p = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-noautorotate", "-i", a.src, "-f", "rawvideo",
         "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    n = W * H * 3
    while True:
        buf = p.stdout.read(n)
        if len(buf) < n:
            break
        yield np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    p.wait()


# Pass 1: each frame's row profile (luma averaged across the row, smoothed down the rows).
prof = []
for f in frames():
    y = f[..., 0] * 0.299 + f[..., 1] * 0.587 + f[..., 2] * 0.114
    prof.append(gaussian_filter1d(y.mean(axis=1), 6))
prof = np.array(prof)
avg = np.copy(prof)
avg[1:-1] = (prof[:-2] + prof[1:-1] + prof[2:]) / 3
gain = np.clip(avg / np.maximum(prof, 1), 0.85, 1.15)

# Pass 2: apply the row gains and encode upright.
enc = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
     "-r", "30", "-i", "-", "-vf",
     f"transpose={a.transpose},scale=1080:1920:flags=lanczos,format=yuv420p",
     "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-movflags", "+faststart", a.out],
    stdin=subprocess.PIPE)
for i, f in enumerate(frames()):
    g = gain[i][:, None, None]
    enc.stdin.write(np.clip(f * g + 0.5, 0, 255).astype(np.uint8).tobytes())
enc.stdin.close()
if enc.wait():
    raise SystemExit("ffmpeg failed")
print(f"{a.out}: {len(prof)} frames, row gains {gain.min():.3f}-{gain.max():.3f}")
