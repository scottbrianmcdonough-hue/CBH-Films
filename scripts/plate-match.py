#!/usr/bin/env python3
"""Render one plate of a match-cut reel: the plate rim levelled, scaled and centred so
every plate's rim lands in the same place, with the shared push-in for its frames.

The rim (from scripts/plate-rim.py) is rotated level, its major axis scaled to --d pixels
wide and its centre put at frame centre. Where the photo doesn't reach the edge of the
9:16 frame (most plates are shot landscape), the photo's own surface carries on: its edge
pixels are extended outwards and defocused more the further they go, and darkened a
little, so the table or cloth reads as falling out of focus around a sharp plate. The
push-in is one continuous zoom across the whole run of plates (1 at film frame 0,
1 + --push at --over), so each clip renders frames --start .. --start + --frames - 1 of
it and the rims stay matched across every cut. Pillow LANCZOS with subpixel crop boxes,
frame by frame, as scripts/kenburns.py.

The spin (--spin-in / --spin-out, frames): across each cut the frame whips round the rim
centre, the outgoing plate turning --spin degrees clockwise and pushing in to --punch
over its last frames (easing in), the incoming one arriving from --spin degrees back at
the same push and easing to rest, so the turn runs through the cut at one speed and the
rims meet at the same size. Each spun frame averages 8 sub-frames for motion blur. (Only
turning the plate inside its rim looked lovely on overhead plates but broke on tilted
ones, where the food stands taller than the rim.)

Usage: scripts/plate-match.py <photo> <out.mp4> --rim cx,cy,a,b,angle --start 0
       --frames 65 [--d 920] [--dy 0] [--cover] [--push 0.06] [--over 262]
       [--spin 12 --punch 1.15 --spin-in 5 --spin-out 5] [--still out.jpg]
"""

import argparse
import subprocess

import cv2
import numpy as np
from PIL import Image

W, H, FPS = 1080, 1920, 30

ap = argparse.ArgumentParser()
ap.add_argument("src")
ap.add_argument("out")
ap.add_argument("--rim", required=True, help="cx,cy,a,b,angle from plate-rim.py")
ap.add_argument("--start", type=int, required=True, help="film frame of the first frame")
ap.add_argument("--frames", type=int, required=True)
ap.add_argument("--d", type=float, default=920, help="rim width on screen at zoom 1")
ap.add_argument("--dy", type=float, default=0,
                help="rim centre below frame centre at zoom 1 (px), to use more of the photo")
ap.add_argument("--cover", action="store_true",
                help="enlarge (and nudge) the plate until the photo fills the frame: no fill"
                " (for the quick flicks, where the rim only has to be roughly in place)")
ap.add_argument("--push", type=float, default=0.06)
ap.add_argument("--over", type=float, default=262, help="film frames for the full push")
ap.add_argument("--spin", type=float, default=12, help="degrees turned each side of a cut")
ap.add_argument("--punch", type=float, default=1.15, help="push-in at the cut")
ap.add_argument("--spin-in", type=int, default=0, help="frames the plate spins in over")
ap.add_argument("--spin-out", type=int, default=0, help="frames the plate spins out over")
ap.add_argument("--still", help="also write the frame at zoom 1 (for checking)")
a = ap.parse_args()

cx, cy, ra, rb, ang = (float(v) for v in a.rim.split(","))
if rb / ra > 0.95:
    ang = 0.0  # a round rim has no axis to level
k = a.d / (2 * ra)  # source px -> screen px at zoom 1
src = cv2.cvtColor(cv2.imread(a.src), cv2.COLOR_BGR2RGB).astype(np.float32)
SH, SW = src.shape[:2]
dx, dy = 0.0, a.dy


def covers(k, dx, dy):
    # Map the frame's corners back into the photo: all inside means no fill is needed.
    m = cv2.getRotationMatrix2D((cx, cy), ang, k)
    m[0, 2] += W / 2 + dx - cx
    m[1, 2] += H / 2 + dy - cy
    inv = cv2.invertAffineTransform(m)
    pts = np.array([[0, 0, 1], [W, 0, 1], [0, H, 1], [W, H, 1]], np.float64) @ inv.T
    return (pts[:, 0] >= 2).all() and (pts[:, 0] <= SW - 2).all() and \
        (pts[:, 1] >= 2).all() and (pts[:, 1] <= SH - 2).all()


if a.cover:
    # The smallest enlargement that fills the frame, with the rim nudged at most 150px
    # sideways or 300px up or down (the nearest such spot to centre).
    nudges = sorted(((x, y) for x in range(-150, 151, 10) for y in range(-300, 301, 10)),
                    key=lambda p: abs(p[0]) + abs(p[1] - a.dy))
    while True:
        hit = next((p for p in nudges if covers(k, *p)), None)
        if hit:
            dx, dy = hit
            break
        k *= 1.01

# The canvas is the frame at zoom 1 in source pixels, plus PAD screen px all round so a
# spinning rim that runs past the frame edge still has picture to turn in.
PAD = 200 if (a.spin_in or a.spin_out) else 0
Wc, Hc = int(np.ceil((W + 2 * PAD) / k)) + 2, int(np.ceil((H + 2 * PAD) / k)) + 2
Href = H / k  # the fill's distances and blurs are fractions of the frame height
# The rim sits `dx`, `dy` off the canvas centre.
ox, oy = dx / k, dy / k

# Level the rim's major axis and move its centre to the canvas centre (source scale).
M = cv2.getRotationMatrix2D((cx, cy), ang, 1.0)
M[0, 2] += Wc / 2 + ox - cx
M[1, 2] += Hc / 2 + oy - cy
rep = cv2.warpAffine(src, M, (Wc, Hc), flags=cv2.INTER_LANCZOS4,
                     borderMode=cv2.BORDER_REPLICATE)
ones = np.ones(src.shape[:2], np.float32)
mask = cv2.warpAffine(ones, M, (Wc, Hc), flags=cv2.INTER_LINEAR,
                      borderMode=cv2.BORDER_CONSTANT, borderValue=0)

if mask.min() < 0.999:
    # Distance outside the photo, as a fraction of the canvas height.
    outside = (mask < 0.5).astype(np.uint8)
    d_out = cv2.distanceTransform(outside, cv2.DIST_L2, 5) / Href
    d_in = cv2.distanceTransform(1 - outside, cv2.DIST_L2, 5) / Href

    def blur(img, sigma_frac):
        # big blurs on a downscaled copy
        s = 4
        small = cv2.resize(img, (Wc // s, Hc // s), interpolation=cv2.INTER_AREA)
        small = cv2.GaussianBlur(small, (0, 0), sigma_frac * Href / s)
        return cv2.resize(small, (Wc, Hc), interpolation=cv2.INTER_CUBIC)

    levels = [(0.0, rep), (0.01, blur(rep, 0.012)), (0.04, blur(rep, 0.04)),
              (0.11, blur(rep, 0.08)), (0.25, blur(rep, 0.12))]
    xs = [x for x, _ in levels]
    # Signed distance: negative inside the photo. The sharp photo holds until a short
    # feather (1.2% of the height) inside its edge, then each blur level takes over in
    # turn as the distance grows (tent weights between neighbouring levels).
    pos = np.where(outside == 1, d_out, -d_in)
    fill = np.zeros_like(rep)
    wsum = np.zeros_like(pos)
    for i, (x0, img) in enumerate(levels):
        lo = xs[i - 1] if i > 1 else -0.012
        up = np.clip((pos - lo) / (x0 - lo), 0, 1) if i > 0 else np.ones_like(pos)
        down = np.clip((xs[i + 1] - pos) / (xs[i + 1] - x0), 0, 1) if i + 1 < len(xs) else 1
        if i == 0:
            down = np.clip(-pos / 0.012, 0, 1)
        w = np.minimum(up, down)
        fill += img * w[..., None]
        wsum += w
    fill /= np.maximum(wsum, 1e-6)[..., None]
    # Darken the extension gently with distance so the eye stays on the plate.
    dark = 1 - 0.38 * np.clip(d_out / 0.25, 0, 1) ** 0.8
    canvas = fill * dark[..., None]
else:
    canvas = rep

canvas = Image.fromarray(np.clip(canvas, 0, 255).astype(np.uint8))

if a.still:
    p = PAD / k
    canvas.resize((W, H), Image.LANCZOS, box=(p, p, p + W / k, p + H / k)).save(
        a.still, quality=92)

OW, OH = W + 2 * PAD, H + 2 * PAD  # the padded output each frame is rendered at
SUB = 8  # motion-blur sub-frames for a spinning frame


def spin_at(t):
    """(clockwise degrees, extra zoom) at clip time t (frames, may be fractional)."""
    e = 0.0
    if a.spin_in and t < a.spin_in:
        e = -(1 - t / a.spin_in) ** 3
    t_out = t - (a.frames - a.spin_out)
    if a.spin_out and t_out > 0:
        e = (t_out / a.spin_out) ** 3
    return a.spin * e, 1 + (a.punch - 1) * abs(e)


def spun(img, z, deg, zoom):
    """`img` (padded output) turned `deg` clockwise and zoomed about the rim centre."""
    rx, ry = OW / 2 + dx * z, OH / 2 + dy * z
    m = cv2.getRotationMatrix2D((rx, ry), -deg, zoom)  # negative: clockwise on screen
    return cv2.warpAffine(img, m, (OW, OH), flags=cv2.INTER_LINEAR,
                          borderMode=cv2.BORDER_REFLECT)


enc = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
     "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
     "-c:v", "libx264", "-preset", "slow", "-crf", "10", "-pix_fmt", "yuv420p",
     "-movflags", "+faststart", a.out],
    stdin=subprocess.PIPE,
)
ccx, ccy = Wc / 2, Hc / 2
for i in range(a.frames):
    # The push zooms about the frame centre, so the rim (and its offset) scales with it
    # the same way on every plate.
    z = 1 + a.push * (a.start + i) / a.over
    cw, ch = OW / k / z, OH / k / z
    box = (ccx - cw / 2, ccy - ch / 2, ccx + cw / 2, ccy + ch / 2)
    frame = canvas.resize((OW, OH), Image.LANCZOS, box=box)
    subs = [spin_at(i + (s + 0.5) / SUB) for s in range(SUB)]
    if any(abs(d) > 1e-3 for d, _ in subs):
        base = np.asarray(frame, np.float32)
        turned = sum(spun(base, z, d, zm) for d, zm in subs) / SUB
        frame = Image.fromarray(np.clip(turned, 0, 255).astype(np.uint8))
    frame = frame.crop((PAD, PAD, PAD + W, PAD + H))
    enc.stdin.write(frame.tobytes())
enc.stdin.close()
if enc.wait():
    raise SystemExit("ffmpeg failed")
z0 = 1 + a.push * a.start / a.over
z1 = 1 + a.push * (a.start + a.frames - 1) / a.over
print(f"{a.out}: {a.frames} frames, zoom {z0:.4f}->{z1:.4f}, scale {k:.3f}, "
      f"rim {2 * ra * k:.0f}px at ({dx:+.0f}, {dy:+.0f})")
