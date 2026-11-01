#!/usr/bin/env python3
"""Join a reel's clips with water ripples (Waterton Park, "its own island": a hall on an
island in a lake, so every cut is a ripple). At each cut a drop lands at a point in the
outgoing shot (on water where there is some) and a ring spreads from it, slowing as it
grows, the next shot showing inside the ring: refracted where the ring passes, with a
couple of fading rings trailing inside it and small wavelets running just ahead of it,
and a faint light on its crest. Calm, no flash, nothing drawn on top. The last cut can
ripple into black (the end card follows in Remotion).

Config (JSON):
  {"out": "...mp4", "clips": ["a.mp4", ...],
   "cuts": [139, 279, ...],              # film frames; clip i plays from cut[i-1]-PRE
   "origins": [[x, y], ...],             # where each ripple starts, frame px
   "to_black": true,                     # the last cut ripples into black
   "mode": "ripple"}                     # or "cut": hard cuts on the beat, cutting on the
                                         # movement (Scott wasn't keen on the ripples); the
                                         # last one fades to black over FADE frames
Clip 0 starts at film frame 0; clip i (i >= 1) at cuts[i-1] - PRE, and every clip must
run to cuts[i] + POST. Usage: scripts/ripple-reel.py <config.json>
"""
import json
import subprocess
import sys

import numpy as np
from scipy import ndimage as nd

W, H, FPS = 1080, 1920, 30
PRE, POST = 14, 34  # the drop lands PRE frames before the beat; the ring is gone POST after

cfg = json.load(open(sys.argv[1]))
clips, cuts, origins = cfg["clips"], cfg["cuts"], cfg["origins"]
to_black = cfg.get("to_black", False)
mode = cfg.get("mode", "ripple")
FADE = 14
starts = [0] + [c - PRE for c in cuts[: len(clips) - 1]]
total = cuts[-1] + POST if to_black else cuts[len(clips) - 2] + POST


class Reader:
    def __init__(self, path):
        self.p = subprocess.Popen(
            ["ffmpeg", "-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "rgb24",
             "-s", f"{W}x{H}", "-"], stdout=subprocess.PIPE)
        self.last = None

    def next(self):
        b = self.p.stdout.read(W * H * 3)
        if len(b) == W * H * 3:
            self.last = np.frombuffer(b, np.uint8).reshape(H, W, 3).astype(np.float32)
        return self.last  # hold the last frame if a clip runs a frame short


yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
ease = lambda t: 1 - (1 - t) ** 2  # a ring slows as it spreads


def warp(img, dx, dy):
    return np.stack([nd.map_coordinates(img[..., c], [yy + dy, xx + dx], order=1, mode="nearest")
                     for c in range(3)], -1)


def ripple(a, b, t, o):
    """a: outgoing frame, b: incoming (or None for black), t: 0..1 through the ripple."""
    ox, oy = o
    rx, ry = xx - ox, yy - oy
    r = np.hypot(rx, ry) + 1e-3
    ux, uy = rx / r, ry / r
    rmax = max(np.hypot(ox - cx, oy - cy) for cx in (0, W) for cy in (0, H)) + 260
    R = rmax * ease(t)
    w = 80 + 100 * t  # the crest's half-width
    s = r - R  # signed distance from the crest, + ahead of it
    fade = 1 - t * 0.6
    # The water's surface is a smooth swell at the crest with low rings trailing inside and
    # finer ones ahead; light bends by the surface's slope, so the picture is displaced by
    # the slope (a lens: magnified on the rise, squeezed on the fall), never smeared.
    def slope(height, ds=1.0):
        return (height(s + ds) - height(s - ds)) / (2 * ds)
    crest = lambda u: 30 * np.exp(-(u / w) ** 2)
    trail = lambda u: np.where(u < 0, 9 * np.exp(u / 260) * np.cos(2 * np.pi * u / 130), 0)
    ahead = lambda u: np.where(u > 0, 3 * np.exp(-u / 110) * np.cos(2 * np.pi * u / 90), 0)
    d = (slope(crest) + slope(trail) + slope(ahead)) * 18 * fade
    dx, dy = -d * ux, -d * uy
    alpha = np.clip((R - w * 0.15 - r) / (w * 0.7), 0, 1)[..., None]  # inside the ring: b
    wa = warp(a, dx, dy)
    wb = warp(b, dx, dy) if b is not None else np.zeros_like(a)
    out = wa * (1 - alpha) + wb * alpha
    light = np.exp(-((s + w * 0.25) / (w * 0.32)) ** 2) * 0.09 * fade  # light on the crest
    out = out * (1 + light[..., None]) + 255 * light[..., None] * 0.15
    return out


writer = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
     "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "16", "-preset", "slow",
     "-pix_fmt", "yuv420p", cfg["out"]], stdin=subprocess.PIPE)
readers = {}
for f in range(total):
    # the clips on screen at f
    live = [i for i in range(len(clips)) if starts[i] <= f]
    for i in live:
        if i not in readers:
            readers[i] = Reader(clips[i])
    frames = {}
    for i in list(readers):
        end = cuts[i] + POST if i < len(cuts) else total
        if f < end:
            frames[i] = readers[i].next()
    cur = max(i for i in frames)  # the newest clip on screen
    out = frames[cur]
    # inside a ripple: from clip k to k+1 (or to black after the last clip)
    if mode == "cut":
        # the clip whose slot holds f; after the last cut, black, faded into
        k = sum(1 for c in cuts if f >= c)
        out = frames.get(k) if k < len(clips) else None
        if out is None:
            last = frames.get(len(clips) - 1)
            fade = np.clip((cuts[-1] - f) / FADE, 0, 1) if last is not None else 0
            out = (last if last is not None else np.zeros((H, W, 3), np.float32)) * fade
        elif to_black and k == len(clips) - 1 and f >= cuts[-1] - FADE:
            out = out * np.clip((cuts[-1] - f) / FADE, 0, 1)
    for k, c in enumerate(cuts if mode == "ripple" else []):
        if c - PRE <= f < c + POST:
            t = (f - (c - PRE)) / (PRE + POST)
            a = frames.get(k)
            b = frames.get(k + 1) if k + 1 < len(clips) else None
            if a is not None:
                out = ripple(a, b, t, origins[k])
    writer.stdin.write(np.clip(out, 0, 255).astype(np.uint8).tobytes())
    if f % 60 == 0:
        print(f"frame {f}/{total}", flush=True)
writer.stdin.close()
writer.wait()
print(f"{cfg['out']}: {total} frames")
