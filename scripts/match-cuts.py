#!/usr/bin/env python3
# Match-cut crop solver. Each still: source size; crop = (k, left, top) at the start, and the
# push zooms 1.00 -> PUSH about the frame centre by the end. Given where the outgoing feature
# sits at the end of its shot, solve the incoming crop that puts the incoming feature at the
# same frame point (and, with two features, the same size), within the source bounds.
import json, sys, subprocess
from PIL import Image, ImageDraw
W, H, PUSH = 1080, 1920, 1.10
R = "/home/user/my-video/public/"

def frame_pos(crop, p, zoom=1.0):
    k, left, top = crop
    x, y = (p[0] - left) * k, (p[1] - top) * k
    return (540 + (x - 540) * zoom, 960 + (y - 960) * zoom)

def solve(size, q, target, k):
    sw, sh = size
    kmin = max(W / sw, H / sh)
    k = max(k, kmin)
    left = q[0] - target[0] / k
    top = q[1] - target[1] / k
    # clamp to the source
    left = min(max(left, 0), sw - W / k)
    top = min(max(top, 0), sh - H / k)
    got = frame_pos((k, left, top), q)
    err = ((got[0] - target[0]) ** 2 + (got[1] - target[1]) ** 2) ** 0.5
    return (k, left, top), err

def render(img_path, crop, zoom, out):
    im = Image.open(img_path).convert("RGB")
    k, left, top = crop
    # crop for the zoomed frame: zoom about the centre = smaller window
    kw = k * zoom
    cx = left + 540 / k
    cy = top + 960 / k
    box = (cx - 540 / kw, cy - 960 / kw, cx + 540 / kw, cy + 960 / kw)
    im.crop(tuple(round(v) for v in box)).resize((W, H), Image.LANCZOS).save(out)
