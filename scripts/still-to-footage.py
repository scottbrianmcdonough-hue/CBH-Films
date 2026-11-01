#!/usr/bin/env python3
"""Render a still as a clip that reads like footage (The Phantom Guests).

Three things move, all gently: the sky drifts sideways behind the building (the sky is
found by growing smooth, sky-coloured regions down from the top edge, feathered, and
filled outward under the building so the drift never reveals a hole); the camera pushes
in slowly; and a soft handheld sway (two slow sines per axis plus a hint of roll) rides
on top, like the phone footage it cuts with. The still can take the moody grade
(scripts/moody-grade.py) at a strength of your choosing first.

Each frame is one affine resample of the composited still straight to 1080x1920
(bicubic, subpixel), piped to ffmpeg and encoded near-lossless.

Usage: scripts/still-to-footage.py <src.jpg> <out.mp4> --cx 700 [--cy ..] [--h ..]
       [--frames 124] [--grade-mix 0.5] [--sky-drift 36] [--no-sky] [--sway 6]
       [--roll 0.25] [--z0 1.03] [--z1 1.09] [--over 120] [--drift 8] [--rise 0]
       [--lift 1.0] [--cool 0] [--sky-dusk 0] [--mist 0 --mist-y 0.8 --mist-h 0.12]
       [--seed 1]
  Spookier, still readable: --cool for twilight colour, --sky-dusk for a stormy dusk sky
  over a readable building, --mist for low mist drifting across the ground.
  Ken Burns: --z0/--z1 push in (or pull back with z1 < z0) over --over frames, --drift
  pans across and --rise tilts up, both in source px per --over. --sway 0 --roll 0 for
  a locked-off move with no handheld feel.
  --sky-drift  source pixels the sky travels across the clip (0 or --no-sky: none)
  --sway       handheld translation amplitude in frame pixels; --roll in degrees
"""
import argparse
import importlib.util
import math
import os
import subprocess

import numpy as np
from PIL import Image
from scipy import ndimage as nd

W, H, FPS = 1080, 1920, 30

ap = argparse.ArgumentParser()
ap.add_argument("src")
ap.add_argument("out")
ap.add_argument("--cx", type=float, required=True)
ap.add_argument("--cy", type=float)
ap.add_argument("--h", type=float)
ap.add_argument("--frames", type=int, default=124)
ap.add_argument("--grade-mix", type=float, default=0.5)
ap.add_argument("--sky-drift", type=float, default=36)
ap.add_argument("--no-sky", action="store_true")
ap.add_argument("--sway", type=float, default=6)
ap.add_argument("--roll", type=float, default=0.25)
ap.add_argument("--z0", type=float, default=1.03)
ap.add_argument("--z1", type=float, default=1.09)
ap.add_argument("--over", type=float, default=120)
ap.add_argument("--drift", type=float, default=8, help="horizontal pan: source px per --over (+ = right)")
ap.add_argument("--rise", type=float, default=0, help="vertical pan: source px per --over (+ = up)")
ap.add_argument("--lift", type=float, default=1.0, help="shadow lift (gamma) after the grade, e.g. 1.25 for a night shot")
ap.add_argument("--cool", type=float, default=0, help="twilight colour, 0-1: cool shadows, greyer stone, warm lights kept")
ap.add_argument("--sky-dusk", type=float, default=0, help="dusk on the sky only, 0-1: darker, stormier, blue-grey")
ap.add_argument("--sky-thr", type=float, help="dusk also covers everything above the first pixel darker than this, per column (for sun glow round a roofline)")
ap.add_argument("--halo", type=float, default=14, help="px from the skyline within which the sky may not outshine the open sky beyond (a photo's edge glow)")
ap.add_argument("--sky-gaps", type=int, default=0, help="dusk also reaches sky seen through foliage within this many px of the sky (pale, sky-coloured gaps)")
ap.add_argument("--mist", type=float, default=0, help="low mist drifting across the ground: peak opacity, e.g. 0.35")
ap.add_argument("--mist-y", type=float, default=0.8, help="mist band centre, fraction of the photo height")
ap.add_argument("--mist-h", type=float, default=0.12, help="mist band half-height, fraction of the photo height")
ap.add_argument("--seed", type=int, default=1)
a = ap.parse_args()

im = Image.open(a.src).convert("RGB")
sw, sh = im.size
ch0 = a.h or sh
cy0 = a.cy if a.cy is not None else sh / 2

spec = importlib.util.spec_from_file_location(
    "moody_grade", os.path.join(os.path.dirname(__file__), "moody-grade.py"))
mg = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mg)
graded = np.asarray(mg.grade(im, a.grade_mix)).astype(np.float32)
if a.lift != 1.0:
    graded = 255.0 * (graded / 255.0) ** (1.0 / a.lift)
LUMA = np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
if a.cool:
    # Twilight: shadows lean blue, stone greys a little; bright warm lights (lit
    # windows, lamps) keep their glow.
    g = graded / 255.0
    l = (g @ LUMA)[..., None]
    warm = np.clip((g[..., 0:1] - g[..., 2:3]) * 3, 0, 1) * np.clip((l - 0.5) * 3, 0, 1)
    k = a.cool * (1 - warm)
    g = l + (g - l) * (1 - 0.35 * k)
    g = g * (1 + k * np.array([-0.06, -0.02, 0.07], dtype=np.float32))
    g = g + k * (1 - l) ** 2 * np.array([-0.02, 0.0, 0.035], dtype=np.float32)
    graded = np.clip(g, 0, 1) * 255.0

# Sky: smooth, sky-coloured regions connected to the top edge.
orig = np.asarray(im).astype(np.float32) / 255
lum = orig.mean(2)
grad = nd.gaussian_filter(
    np.hypot(nd.sobel(nd.gaussian_filter(lum, 1.5), 0), nd.sobel(nd.gaussian_filter(lum, 1.5), 1)), 3)
sat = orig.max(2) - orig.min(2)
skycol = (orig[..., 2] > orig[..., 1] + 0.01) | ((lum > 0.6) & (sat < 0.18))
cand = (lum > 0.25) & ((grad < 0.05) | ((grad < 0.14) & skycol))
lab, _ = nd.label(cand)
top = [v for v in np.unique(lab[:3]) if v]
sky = np.isin(lab, top) if top and not a.no_sky and (a.sky_drift or a.sky_dusk) else np.zeros_like(cand)
if sky.any():
    sky = nd.binary_opening(nd.binary_fill_holes(nd.binary_closing(sky, iterations=4)), iterations=2)
    hard = nd.binary_erosion(sky, iterations=3)
    alpha = nd.gaussian_filter(hard.astype(np.float32), 2)[..., None]
    if a.sky_dusk:
        # Dusk on the sky alone: darker, stormier (more cloud contrast), blue-grey.
        # Reach the thin rim of pale sky the mask misses along rooflines: bright pixels
        # just outside it count as sky too.
        # Edge pixels the mask missed (pale haze along a roofline or treeline): within
        # 14px of the sky, each pixel is compared with the sky right beside it and with
        # the building just inside, and counts as sky as far as it looks more like sky.
        def nblur(img, mask, sig, fallback):
            mf = mask.astype(np.float32)
            out = []
            for sg in (sig, fallback):
                den = nd.gaussian_filter(mf, sg)
                num = np.stack([nd.gaussian_filter(img[..., k] * mf, sg) for k in range(3)], -1)
                out.append((num / np.maximum(den, 1e-4)[..., None], den))
            (c1, d1), (c2, _) = out
            return np.where((d1 > 0.05)[..., None], c1, c2)
        band = nd.binary_dilation(sky, iterations=14) & ~sky
        skyc = nblur(orig, sky, 4, 16)
        fgc = nblur(orig, ~nd.binary_dilation(sky, iterations=16), 8, 30)
        ds = np.sqrt(((orig - skyc) ** 2).sum(-1))
        dfg = np.sqrt(((orig - fgc) ** 2).sum(-1))
        rim = band * np.clip((dfg / (ds + dfg + 1e-4) - 0.4) / 0.25, 0, 1)
        if a.sky_gaps:
            # Sky seen through a tree: pale pixels the colour of this sky, near it.
            mean_sky = orig[sky].mean(0)
            dg = np.sqrt(((orig - mean_sky) ** 2).sum(-1))
            gaps = (nd.binary_dilation(sky, iterations=a.sky_gaps) & ~sky) * np.clip(
                1 - (dg - 0.12) / 0.15, 0, 1) * np.clip((lum - 0.45) / 0.1, 0, 1)
            rim = np.maximum(rim, gaps)
        cover = sky.astype(np.float32)
        if a.sky_thr is not None:
            # Everything above the roofline, column by column: rows above the first pixel
            # darker than the threshold (catches a bright sun glow round the chimneys).
            above = np.cumsum(nd.gaussian_filter(lum, 1) < a.sky_thr, axis=0) == 0
            cover = np.maximum(cover, above.astype(np.float32))
        soft = np.maximum(nd.gaussian_filter(cover, 2), rim)
        soft = nd.gaussian_filter(soft, 1)[..., None] * a.sky_dusk
        g = graded / 255.0
        l = (g @ LUMA)[..., None]
        mean = float((l[..., 0] * sky).sum() / max(sky.sum(), 1))
        dusk = (mean + (l - mean) * 1.35) * 0.62
        dusk = np.clip(dusk, 0, 1) * np.array([0.82, 0.9, 1.08], dtype=np.float32)
        dusk = dusk + (g - l) * 0.25
        g = np.clip(g * (1 - soft) + dusk * soft, 0, 1)
        # The last pale sliver along the edge (pixels half sky, half stone): in a 3px strip
        # just outside the sky, nothing may be brighter than the dusk sky beside it.
        cov = cover > 0.5
        mk = cov.astype(np.float32)
        dd = nd.gaussian_filter(mk, 6)
        local = np.stack([nd.gaussian_filter(g[..., k] * mk, 6) for k in range(3)], -1)
        local = local / np.maximum(dd, 1e-4)[..., None]
        strip = (nd.binary_dilation(cov, iterations=3) & ~cov & (dd > 0.02))[..., None]
        g = np.where(strip, np.minimum(g, local + 0.03), g)
        # A sky brighter near the horizon keeps that glow through the dusk, and along a
        # tower or treeline it reads as a halo: within 12px of the edge (inside the sky),
        # nothing may be brighter than the open sky further out.
        # Photos processed with a strong edge glow carry it 30-40px out, so the reference
        # is the open sky beyond --halo px, and the limit eases off with distance.
        R = a.halo
        dist = nd.distance_transform_edt(cov)
        open_sky = (dist > R).astype(np.float32)
        od = nd.gaussian_filter(open_sky, R)
        ol = nd.gaussian_filter((g @ LUMA) * open_sky, R) / np.maximum(od, 1e-4)
        edge = cov & (dist <= R) & (od > 0.02)
        gl = g @ LUMA
        allow = ol + 0.02 + 0.03 * np.clip(dist / R, 0, 1)
        scale = np.where(edge & (gl > allow), allow / np.maximum(gl, 1e-4), 1.0)
        scale = nd.gaussian_filter(scale.astype(np.float32), 1.5)
        g = g * scale[..., None]
        graded = g * 255.0
    # Fill the sky outward under everything else, so the drift reveals sky, not a hole:
    # a smooth normalised blur of the sky's own colours (fine near the edge, coarser
    # further in), never streaks of the nearest pixel.
    m = hard.astype(np.float32)
    fill = np.zeros_like(graded)
    got = np.zeros(m.shape, np.float32)
    for sigma in (6, 24, 96):
        den = nd.gaussian_filter(m, sigma)
        num = np.stack([nd.gaussian_filter(graded[..., k] * m, sigma) for k in range(3)], -1)
        ok = (den > 1e-3) & (got < 0.5)
        fill[ok] = num[ok] / den[ok][:, None]
        got[ok] = 1
    sky_layer = np.where(hard[..., None], graded, fill)
    sky_img = Image.fromarray(np.clip(sky_layer, 0, 255).astype(np.uint8))
else:
    alpha = None

rng = np.random.default_rng(a.seed)
ph = rng.uniform(0, 2 * math.pi, 6)

# Low mist that behaves like mist: two layers (finer and nearer, broader and further),
# each drifting slowly sideways while its wisps form, thin and swell (a slow crossfade
# between two noise fields, out of step between layers) and roll gently up and down (a
# travelling wave through the field). Built at quarter size, in a band across the ground
# that thickens towards the bottom.
Q = 4
mist_layers = []
if a.mist:
    qh, qw = sh // Q + 1, (sw + 2 * sw) // Q + 1
    yq = np.linspace(0, 1, qh, dtype=np.float32)[:, None]
    band = np.exp(-(((yq - a.mist_y) / a.mist_h) ** 2))
    band = np.where(yq > a.mist_y, np.maximum(band, 0.55), band)
    for k, (oct_, speed, period, phase) in enumerate(((1.0, 0.28, 170, 0.0), (0.65, 0.5, 120, 1.9))):
        fields = []
        for _ in range(2):
            q = rng.standard_normal((qh, qw)).astype(np.float32)
            q = nd.gaussian_filter(q, (7 * oct_, 34 * oct_), mode="wrap")
            fields.append((q - q.mean()) / q.std())
        mist_layers.append((fields, speed, period, phase, oct_))


def mist_alpha(f):
    total = np.zeros((sh // Q + 1, sw // Q + 1), np.float32)
    yy, xx = np.mgrid[0:total.shape[0], 0:total.shape[1]].astype(np.float32)
    for fields, speed, period, phase, oct_ in mist_layers:
        w = 0.5 - 0.5 * math.cos(2 * math.pi * f / period + phase)
        field = fields[0] * math.sqrt(1 - w) + fields[1] * math.sqrt(w)
        # Drift sideways, and roll: a slow wave lifting and lowering the wisps.
        x = xx + speed * f / Q + sw / Q
        y = yy + 5 * oct_ * np.sin(2 * math.pi * (xx / (160 * oct_) - f / (FPS * 7)) + phase)
        m = nd.map_coordinates(field, [y, x], order=1, mode="wrap")
        m = np.clip((m + 0.2) / 1.6, 0, 1) ** 1.3
        total = 1 - (1 - total) * (1 - m * band[: total.shape[0]] * 0.75)
    img = Image.fromarray((np.clip(total, 0, 1) * 255).astype(np.uint8)).resize((sw, sh), Image.BICUBIC)
    return np.asarray(img).astype(np.float32)[..., None] / 255.0


MIST_RGB = np.array([196, 204, 216], dtype=np.float32)


def sway(t):
    """Handheld offsets at time t (s): x, y in frame px, roll in radians."""
    x = a.sway * (0.65 * math.sin(2 * math.pi * 0.23 * t + ph[0]) + 0.35 * math.sin(2 * math.pi * 0.61 * t + ph[1]))
    y = a.sway * (0.65 * math.sin(2 * math.pi * 0.19 * t + ph[2]) + 0.35 * math.sin(2 * math.pi * 0.53 * t + ph[3]))
    r = math.radians(a.roll) * (0.7 * math.sin(2 * math.pi * 0.17 * t + ph[4]) + 0.3 * math.sin(2 * math.pi * 0.47 * t + ph[5]))
    return x, y, r


enc = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
     "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
     "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-pix_fmt", "yuv420p",
     "-movflags", "+faststart", a.out],
    stdin=subprocess.PIPE,
)
for f in range(a.frames):
    t = f / FPS
    if alpha is not None:
        dx = a.sky_drift * f / max(a.frames - 1, 1)
        moved = np.asarray(sky_img.transform(sky_img.size, Image.AFFINE, (1, 0, -dx, 0, 1, 0), Image.BICUBIC)).astype(np.float32)
        comp = graded * (1 - alpha) + moved * alpha
    else:
        comp = graded
    if mist_layers:
        comp = comp + (MIST_RGB - comp) * mist_alpha(f) * a.mist
    src = Image.fromarray(np.clip(comp, 0, 255).astype(np.uint8))
    z = a.z0 + (a.z1 - a.z0) * f / a.over
    ch = ch0 / z
    s = ch / H  # source px per frame px
    cx = a.cx + a.drift * f / a.over
    cx = min(max(cx, ch * W / H / 2 + 4), sw - ch * W / H / 2 - 4)
    cy = cy0 - a.rise * f / a.over
    cy = min(max(cy, ch / 2 + 4), sh - ch / 2 - 4)
    ox, oy, r = sway(t)
    c, sn = math.cos(r), math.sin(r)
    # Frame pixel (u, v) -> source (x, y): rotate and scale about the frame centre.
    au, bu = s * c, -s * sn
    av, bv = s * sn, s * c
    u0, v0 = W / 2 + ox, H / 2 + oy
    coeffs = (au, bu, cx - au * u0 - bu * v0, av, bv, cy - av * u0 - bv * v0)
    frame = src.transform((W, H), Image.AFFINE, coeffs, Image.BICUBIC)
    enc.stdin.write(frame.tobytes())
enc.stdin.close()
if enc.wait():
    raise SystemExit("ffmpeg failed")
print(f"{a.out}: {a.frames} frames, sky {'drifting' if alpha is not None else 'still'}")
