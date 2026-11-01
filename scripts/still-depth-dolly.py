#!/usr/bin/env python3
"""Render a still as a short camera move with real depth (Departures; Scott: "add more
depth on shots, make it look more real, not AI").

MiDaS v2.1 small (ONNX) estimates how near each part of the photo is; the camera then
moves the way a real one would, at constant speed so the cuts flow (Scott: "not so stop
start ... smooth and flow"; --ease to ease in and out): a glide (--glide) or push where near
things (a foreground tree, the heather at your feet, a chair) travel further than the
fells behind them (--parallax, small so the image never visibly stretches), and an
optional dolly-in that swells the near layer a little more than the far (--dolly). No
handheld wobble. Each frame is one backward warp of the photo to 1080x1920 (bicubic,
subpixel), piped to ffmpeg.

The model is not in the repo: download it once from the official MiDaS release,
https://github.com/isl-org/MiDaS/releases/download/v2_1/model-small.onnx
to ~/.cache/midas/model-small.onnx (pip install onnxruntime scipy).

Usage: scripts/still-depth-dolly.py <src.jpg> <out.mp4> --cx 700 [--cy ..] [--h ..]
       [--frames 60] [--z0 1.0] [--z1 1.08] [--glide 0] [--parallax 30] [--dolly 0.04]
       [--depth-png out.png]
  --glide     the crop's centre travels this many source px to the right over the shot
              (negative: left); near things travel further by --parallax frame px
  --parallax  extra frame px the nearest layer moves, against the glide (or outward
              from the centre on a push with no glide)
  --dolly     extra zoom on the nearest layer at the end, e.g. 0.04
"""
import argparse
import os
import subprocess

import numpy as np
import onnxruntime as ort
from PIL import Image
from scipy import ndimage as nd

W, H, FPS = 1080, 1920, 30
ap = argparse.ArgumentParser()
ap.add_argument("src")
ap.add_argument("out")
ap.add_argument("--cx", type=float, required=True)
ap.add_argument("--cy", type=float)
ap.add_argument("--h", type=float)
ap.add_argument("--frames", type=int, default=60)
ap.add_argument("--z0", type=float, default=1.0)
ap.add_argument("--z1", type=float, default=1.08)
ap.add_argument("--glide", type=float, default=0)
ap.add_argument("--glide-y", type=float, default=0, help="the crop's centre travels this many source px down over the "
                "shot (negative: up), e.g. a tilt up as it pushes in so a tower's top stays in frame")
ap.add_argument("--parallax", type=float, default=30)
ap.add_argument("--dolly", type=float, default=0.04)
ap.add_argument("--depth-png")
ap.add_argument("--depth-img", help="a hand-made depth map (grayscale, white near) used instead of MiDaS: for a shot "
                "where the model splits one object (Waterton's cake stand: its base read near, its top far, so the "
                "legs bent as the table slid)")
ap.add_argument("--ease", action="store_true", help="ease in and out (default: constant speed, so cuts flow)")
ap.add_argument("--soften", type=float, default=60, help="depth blur: the photo's long side / this (lower = softer edges)")
ap.add_argument("--layer", help="a matte (white = a solid object, e.g. a cup) moved as one rigid layer over the "
                "rest, the background filled in behind it, so nothing behind it warps (Scott: \"watch the warping\")")
ap.add_argument("--fill-full", action="store_true", help="with --layer: fill behind it at full size, not a quarter "
                "(for a thin layer, a wire stand, over soft background)")
ap.add_argument("--hole", type=int, help="with --layer: px the fill reaches past the layer's edge (default 33, "
                "9 with --fill-full); it must cover how far the layer slides over the background")
ap.add_argument("--layer-near", type=float, help="the layer's nearness 0..1, for a rigid layer (a cup); without it the "
                "layer keeps its own depth (a hillside), cut clean at its edge so the background behind never bends")
ap.add_argument("--fill-dir", help="with --layer: fill behind it by mirroring the picture along this direction "
                "(x,y; e.g. 1,0 for a lake running left to right) near its edge, so the texture carries through "
                "where the layer uncovers it (a blurred fill showed as a smooth patch in the water)")
ap.add_argument("--size", default="1080x1920", help="output size, e.g. 1080x1350 for LinkedIn 4:5")
ap.add_argument("--model", default=os.path.expanduser("~/.cache/midas/model-small.onnx"))
a = ap.parse_args()
W, H = map(int, a.size.split("x"))

im = Image.open(a.src).convert("RGB")
# work from the photo at the size the frame needs (a 5k photo is 2-3x more than a 1080 frame
# uses), with room to spare for the zoom
f0 = min(1.0, 1.3 * H / (a.h or im.size[1]) * max(a.z0, a.z1))
if f0 < 0.95:
    im = im.resize((round(im.size[0] * f0), round(im.size[1] * f0)), Image.LANCZOS)
    a.cx *= f0
    a.glide *= f0
    if a.cy is not None:
        a.cy *= f0
    if a.h:
        a.h *= f0
sw, sh = im.size
src = np.asarray(im, dtype=np.float32)

# nearness 0 (far) .. 1 (near), smooth so depth steps never tear
if a.depth_img:
    near = np.asarray(Image.open(a.depth_img).convert("L").resize((sw, sh), Image.BICUBIC),
                      dtype=np.float32) / 255.0
x = np.asarray(im.resize((256, 256), Image.BICUBIC), dtype=np.float32) / 255.0
x = ((x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]).transpose(2, 0, 1)[None]
if not a.depth_img:
    sess = ort.InferenceSession(a.model, providers=["CPUExecutionProvider"])
    d = sess.run(None, {sess.get_inputs()[0].name: x.astype(np.float32)})[0].squeeze()
    lo, hi = np.percentile(d, [2, 98])
    d = np.clip((d - lo) / (hi - lo + 1e-6), 0, 1)
    near = np.asarray(Image.fromarray((d * 255).astype(np.uint8)).resize((sw, sh), Image.BICUBIC),
                      dtype=np.float32) / 255.0
# soft depth so a sharp subject against the sky never tears at its edge (Scott saw the
# red-backpacked walker wobble at /160)
near = nd.gaussian_filter(near, max(sw, sh) / a.soften)
if a.depth_png:
    Image.fromarray((near * 255).astype(np.uint8)).save(a.depth_png)

fg_alpha = None
if a.layer:
    import cv2
    fg_alpha = np.asarray(Image.open(a.layer).convert("L").resize((sw, sh), Image.BILINEAR), dtype=np.float32) / 255
    sig = max(sw, sh) / a.soften  # how far the softened depth bleeds across an edge
    if a.layer_near is not None:
        layer_near = a.layer_near
    else:
        # the layer's own depth, taken from well inside it and carried out past its edge
        # (not too far in: a thin subject on the layer's edge, the walker on the cliff, took the
        # depth of the slope below and slid off his own ledge: Scott, "his feet get into the blue")
        inner = cv2.erode((fg_alpha > 0.5).astype(np.uint8), np.ones((3, 3), np.uint8), iterations=int(0.6 * sig))
        idx = nd.distance_transform_edt(inner == 0, return_distances=False, return_indices=True)
        layer_near = near[idx[0], idx[1]]
        # and on the layer itself, what sticks up from it (the walker) stands on what is below
        # it: it takes the depth of the first inner pixel down its column, so it rides with the
        # ground under its feet instead of whatever inner pixel is nearest to the side
        rows = np.where(inner > 0, np.arange(sh)[:, None], sh)
        below = np.minimum.accumulate(rows[::-1], axis=0)[::-1]
        on = (fg_alpha > 0.02) & (below < sh)
        layer_near[on] = near[below[on], np.nonzero(on)[1]]
    # fill in behind the layer (at a quarter size: it only shows at the edges as the layer moves)
    q = 4
    # wide enough that a thin subject (a walker) leaves no dark ghost in the quarter-size fill
    # with a full-size fill only the layer itself (and its soft edge) needs painting out: a
    # wide band round a thin wire showed as a smudge in the bokeh (Scott: "fix the blur")
    # (but wide enough for everything the layer slides off: too tight and the photo's own
    # plates showed as ghost rims at the start of the tea move, so there --hole is set wide and
    # --fill-dir mirrors the background in)
    k = a.hole or (9 if a.fill_full else 33)
    # the glide slides the layer sideways: reach further across than up and down
    hole = cv2.dilate((fg_alpha > 0.02).astype(np.uint8), np.ones((max(9, k // 2), k), np.uint8))
    hq = cv2.resize(hole, (sw // q, sh // q), interpolation=cv2.INTER_NEAREST)
    small = cv2.resize(src.astype(np.uint8), (sw // q, sh // q), interpolation=cv2.INTER_AREA)
    if a.fill_full:
        # a thin layer (a wire cake stand) over soft bokeh: fill at full size, so the band the
        # wire uncovers is as sharp as the blur round it (a quarter-size fill showed a smudge)
        filled = cv2.inpaint(src.astype(np.uint8), hole, 12, cv2.INPAINT_TELEA)
    else:
        filled = cv2.resize(cv2.inpaint(small, hq, 12, cv2.INPAINT_TELEA), (sw, sh), interpolation=cv2.INTER_CUBIC)
    hs = cv2.GaussianBlur(hole.astype(np.float32), (0, 0), 3)[..., None]
    src_fg = src
    if a.fill_dir:
        # near the layer's edge (all the move ever uncovers), mirror the picture in along
        # fill_dir from beyond the hole, so ripples and grass carry through
        u = np.array([float(v) for v in a.fill_dir.split(",")])
        u /= np.linalg.norm(u)
        edge_band = (hole > 0) & (nd.distance_transform_edt(hole > 0) < 0.12 * max(sw, sh))
        ys, xs = np.nonzero(edge_band)
        img8 = src.astype(np.uint8)
        acc = np.zeros((len(ys), 3), np.float32)
        wsum = np.zeros(len(ys), np.float32)
        for sgn in (1, -1):
            todo = np.ones(len(ys), bool)
            for t in range(1, int(0.25 * max(sw, sh))):
                x = np.rint(xs + sgn * u[0] * t).astype(int)
                y = np.rint(ys + sgn * u[1] * t).astype(int)
                inside = (x >= 0) & (x < sw) & (y >= 0) & (y < sh)
                ok = todo & inside
                ok[ok] = hole[y[ok], x[ok]] == 0
                if ok.any():
                    xm = np.rint(xs + sgn * u[0] * 2 * t).astype(int)
                    ym = np.rint(ys + sgn * u[1] * 2 * t).astype(int)
                    okm = ok & (xm >= 0) & (xm < sw) & (ym >= 0) & (ym < sh)
                    okm[okm] = hole[ym[okm], xm[okm]] == 0
                    col = np.zeros((len(ys), 3), np.float32)
                    col[ok] = img8[y[ok], x[ok]]
                    col[okm] = img8[ym[okm], xm[okm]]
                    acc[ok] += col[ok] / t
                    wsum[ok] += 1 / t
                todo &= ~ok & inside
                if not todo.any():
                    break
        got = wsum > 0
        filled = filled.astype(np.float32)
        filled[ys[got], xs[got]] = acc[got] / wsum[got][:, None]
    src = src * (1 - hs) + filled.astype(np.float32) * hs
    nq = cv2.resize((near * 255).astype(np.uint8), (sw // q, sh // q), interpolation=cv2.INTER_AREA)
    # the depth just round the layer is blurred with the layer's own: fill in from further out
    hq_d = cv2.dilate(hq, np.ones((3, 3), np.uint8), iterations=max(1, int(1.5 * sig / q)))
    near_filled = cv2.resize(cv2.inpaint(nq, hq_d, 12, cv2.INPAINT_TELEA), (sw, sh),
                             interpolation=cv2.INTER_CUBIC).astype(np.float32) / 255
    hd = cv2.GaussianBlur(cv2.resize(hq_d, (sw, sh), interpolation=cv2.INTER_NEAREST).astype(np.float32), (0, 0), 3)
    near = near * (1 - hd) + near_filled * hd

# cubic spline coefficients once, not every frame
coef = [nd.spline_filter(src[..., c], order=3, mode="nearest") for c in range(3)]
coef_fg = [nd.spline_filter(src_fg[..., c], order=3, mode="nearest") for c in range(3)] if fg_alpha is not None else None
ch = a.h or sh
cy0 = a.cy if a.cy is not None else sh / 2
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
ease = lambda t: t * t * (3 - 2 * t)

p = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
     "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "16", "-preset", "slow",
     "-pix_fmt", "yuv420p", a.out],
    stdin=subprocess.PIPE)
for f in range(a.frames):
    t = f / max(a.frames - 1, 1)
    e = ease(t) if a.ease else t
    z = a.z0 + (a.z1 - a.z0) * t
    k = H / ch * z  # frame px per source px
    cx = a.cx + a.glide * e
    cy = cy0 + a.glide_y * e
    def warp(nearness):
        # frame px -> source px, before depth
        sx = cx + (xx - W / 2) / k
        sy = cy + (yy - H / 2) / k
        n = nearness if np.isscalar(nearness) else nd.map_coordinates(
            nearness, [np.clip(sy, 0, sh - 1), np.clip(sx, 0, sw - 1)], order=1)
        # near things: further along the glide (in frame px), or out from the centre on a push
        if a.glide:
            shift = -np.sign(a.glide) * a.parallax * (e - 0.5) * 2 * n
            sx = sx - shift / k
        else:
            sx = sx - ((xx - W / 2) * a.parallax / (W / 2)) * (e - 0.5) * n / k
            sy = sy - ((yy - H / 2) * a.parallax / (W / 2)) * (e - 0.5) * n / k
        if a.dolly:
            g = 1 + a.dolly * e * n
            sx = cx + (sx - cx) / g
            sy = cy + (sy - cy) / g
        return [np.clip(sy, 0, sh - 1), np.clip(sx, 0, sw - 1)]

    at = warp(near)
    frame = np.stack([nd.map_coordinates(coef[c], at, order=3, mode="nearest", prefilter=False)
                      for c in range(3)], -1)
    if fg_alpha is not None:
        # the layer: rigid at one nearness, or carried by its own depth
        at = warp(layer_near)
        al = nd.map_coordinates(fg_alpha, at, order=1)[..., None]
        fg = np.stack([nd.map_coordinates(coef_fg[c], at, order=3, mode="nearest", prefilter=False)
                       for c in range(3)], -1)
        frame = frame * (1 - al) + fg * al
    p.stdin.write(np.clip(frame, 0, 255).astype(np.uint8).tobytes())
p.stdin.close()
p.wait()
print(f"{a.out}: {a.frames} frames")
