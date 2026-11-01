#!/usr/bin/env python3
"""Find the rim of the plate in a food photo, for match cuts that line every rim up.

Fits ellipses to the photo's long edge arcs (alone and in pairs, since a rim is often
broken by food, cutlery or the frame edge), scores each by how much of its perimeter
lies on an edge whose gradient points across the rim, and prints the best as source
pixels: centre, semi-axes and the angle of the major axis. A rim that runs off the
photo still fits from the arcs that are visible. Writes an overlay so the fit can be
checked by eye; when an arc on the food or the table wins instead, pass --hint with the
rough centre and diameter to keep the search on the plate.

Requires opencv-python-headless and numpy.
Usage: scripts/plate-rim.py <photo> [--overlay out.jpg] [--hint cx,cy,diameter] [--top 3]
"""

import argparse
import json

import cv2
import numpy as np

parser = argparse.ArgumentParser()
parser.add_argument("photo")
parser.add_argument("--overlay", help="write the photo with the fitted rim drawn on it")
parser.add_argument("--hint", help="rough rim centre and diameter in source px: cx,cy,d")
parser.add_argument("--top", type=int, default=1, help="print this many candidates")
args = parser.parse_args()

src = cv2.imread(args.photo)
H, W = src.shape[:2]
SCALE = 640 / max(H, W)
img = cv2.resize(src, (round(W * SCALE), round(H * SCALE)), interpolation=cv2.INTER_AREA)
h, w = img.shape[:2]
gray = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), (5, 5), 1.4)
gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
mag = np.hypot(gx, gy)
med = np.median(mag)
edges = cv2.Canny(gray, 30, 90)
dist = cv2.distanceTransform(255 - edges, cv2.DIST_L2, 3)

# Long arcs: split edge contours at sharp turns so each piece is smooth.
contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
arcs = []
for c in contours:
    pts = c[:, 0, :].astype(np.float32)
    if len(pts) < 30:
        continue
    # contours trace both sides of a thin edge: keep the first pass only
    half = pts[: max(30, len(pts) // 2)]
    arcs.append(half)
arcs.sort(key=len, reverse=True)
arcs = arcs[:60]

hint = None
if args.hint:
    hx, hy, hd = (float(v) for v in args.hint.split(","))
    hint = (hx * SCALE, hy * SCALE, hd * SCALE)

N = 720
theta = np.linspace(0, 2 * np.pi, N, endpoint=False)


def score(ell):
    (cx, cy), (d1, d2), ang = ell
    a, b = d1 / 2, d2 / 2
    if min(a, b) < 0.15 * min(w, h) or max(a, b) > 1.6 * max(w, h):
        return -1
    if min(a, b) / max(a, b) < 0.3:
        return -1
    t = np.deg2rad(ang)
    ex, ey = a * np.cos(theta), b * np.sin(theta)
    x = cx + ex * np.cos(t) - ey * np.sin(t)
    y = cy + ex * np.sin(t) + ey * np.cos(t)
    # outward normal of the ellipse at each sample
    nx_, ny_ = np.cos(theta) / a, np.sin(theta) / b
    nx = nx_ * np.cos(t) - ny_ * np.sin(t)
    ny = nx_ * np.sin(t) + ny_ * np.cos(t)
    nn = np.hypot(nx, ny)
    nx, ny = nx / nn, ny / nn
    inside = (x >= 2) & (x < w - 2) & (y >= 2) & (y < h - 2)
    if inside.sum() < N * 0.25:
        return -1
    xi, yi = x[inside].astype(int), y[inside].astype(int)
    near = dist[yi, xi] <= 1.5
    g = np.stack([gx[yi, xi], gy[yi, xi]], 1)
    gm = np.hypot(g[:, 0], g[:, 1]) + 1e-6
    align = np.abs(g[:, 0] * nx[inside] + g[:, 1] * ny[inside]) / gm
    strong = gm > med * 2
    support = (near & (align > 0.85) & strong).sum()
    # support counts rim length found; reward big, mostly-visible rims a little
    s = support * (0.6 + 0.4 * inside.mean())
    if hint:
        d = np.hypot(cx - hint[0], cy - hint[1])
        size = abs(max(a, b) * 2 - hint[2]) / hint[2]
        if d > 0.2 * hint[2] or size > 0.3:
            return -1
    return s


cands = []
for i, a in enumerate(arcs):
    if len(a) >= 5:
        cands.append(cv2.fitEllipse(a))
    for b in arcs[i + 1 : 40]:
        cands.append(cv2.fitEllipse(np.vstack([a, b])))
# Refine: refit to the edge points lying on the best candidates.
scored = sorted(((score(e), e) for e in cands), key=lambda t: t[0], reverse=True)
ys, xs = np.nonzero(edges)
pts = np.stack([xs, ys], 1).astype(np.float32)


def refine(ell):
    for _ in range(3):
        (cx, cy), (d1, d2), ang = ell
        t = np.deg2rad(ang)
        dx, dy = pts[:, 0] - cx, pts[:, 1] - cy
        u = dx * np.cos(t) + dy * np.sin(t)
        v = -dx * np.sin(t) + dy * np.cos(t)
        r = np.sqrt((u / (d1 / 2)) ** 2 + (v / (d2 / 2)) ** 2)
        on = np.abs(r - 1) < 0.012
        if on.sum() < 20:
            break
        new = cv2.fitEllipse(pts[on])
        if score(new) < score(ell):
            break
        ell = new
    return ell


best = []
for s, e in scored[: args.top * 8]:
    if s <= 0:
        continue
    e = refine(e)
    if all(np.hypot(e[0][0] - b[1][0][0], e[0][1] - b[1][0][1]) > 8 for b in best):
        best.append((score(e), e))
    if len(best) >= args.top:
        break


def out(ell):
    (cx, cy), (d1, d2), ang = ell
    # report the major axis as `a` and its angle from horizontal, in (-90, 90]
    if d2 > d1:
        d1, d2, ang = d2, d1, ang + 90
    ang = (ang + 90) % 180 - 90
    return {
        "cx": round(cx / SCALE, 1),
        "cy": round(cy / SCALE, 1),
        "a": round(d1 / 2 / SCALE, 1),
        "b": round(d2 / 2 / SCALE, 1),
        "angle": round(ang, 2),
    }


for s, e in best:
    print(json.dumps({**out(e), "score": round(float(s), 1)}))

if args.overlay and best:
    ov = src.copy()
    for k, (s, e) in enumerate(best):
        (cx, cy), (d1, d2), ang = e
        cv2.ellipse(
            ov,
            ((cx / SCALE, cy / SCALE), (d1 / SCALE, d2 / SCALE), ang),
            (0, 255, 255) if k == 0 else (255, 0, 255),
            max(3, round(4 / SCALE / 2)),
        )
    cv2.imwrite(args.overlay, ov)
