#!/usr/bin/env python3
"""Starry Night, but a CBH hotel (Scott, 16 Nov: TikTok "animation stuff like the starry night").

A dusk photo of a hotel repainted in moving dabs of paint: the sky a field of short dabs flowing round
swirls and round each star, the stars and a moon coming out one by one inside their rings of dabs, the
hotel in small dabs that barely stir. Every dab is a brush mark, not a line (Scott: the first version
"just looks like bars", "more hand painted, pointillism"): a ragged-edged stamp with bristle streaks, laid
with its own thickness, and the built-up paint is lit from the top left so ridges catch the light; the
colours are broken (blues beside greens and violets, the odd warm fleck), on a canvas weave. Then the paint clears outwards from the lit doorway and it is the
real photograph, on a slow push in.

The photo sits low in the 9:16 frame with its own sky carried on upwards, so the sky is half the picture.
Writes public/stings/starry-night.mp4 (and --stills DIR for check frames).

  python3 scripts/starry-night.py
"""
import argparse
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/campaigns/november-best-loved/frensham-pond/exterior-dusk.jpg"
OUT = ROOT / "public/stings/starry-night.mp4"
W, H, FPS = 1080, 1920, 30
PAINT = 165  # frames of painting before the paint starts to clear
CLEAR = 48  # frames the clearing takes
TOTAL = 300
SCALE, CX, TOP = 1.2, 0.57, 560  # the photo's scale, the crop's centre across it, where its top sits
DOOR = (430, 1330)  # the lit doorway the real picture spreads from

# other hotels (--name): the photo, its placing and the lit doorway the clearing spreads from
VARIANTS = {
    "hythe": {"src": "public/campaigns/journey-new/hythe-ballroom-dusk.jpg", "scale": 1.2, "cx": 0.5, "top": 560, "door": (540, 1500)},
}

rng = np.random.default_rng(7)


def smooth(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def build_real():
    """The photo placed in the frame, its sky carried on up to the top."""
    im = cv2.imread(str(SRC))
    h, w = im.shape[:2]
    cw = int(W / SCALE)
    x0 = int(w * CX - cw / 2)
    crop = cv2.resize(im[:, x0 : x0 + cw], (W, int(h * SCALE)), interpolation=cv2.INTER_CUBIC)
    canvas = np.zeros((H, W, 3), np.float32)
    ph = min(H - TOP, crop.shape[0])
    canvas[TOP : TOP + ph] = crop[:ph]
    # the sky above: the photo's top rows, blurred across, deepening towards the top of the frame
    top = cv2.GaussianBlur(crop[:24].astype(np.float32), (0, 0), 40).mean(axis=0)  # (W, 3)
    grad = cv2.GaussianBlur(crop[:160].astype(np.float32), (0, 0), 30)
    slope = (grad[0] - grad[150]).mean(axis=0) / 150.0  # the photo's own change per row, going up
    for y in range(TOP):
        d = TOP - y
        ease = 1 - np.exp(-d / 420.0)
        col = top + slope * 420.0 * ease * 1.1
        canvas[y] = np.clip(col * (1 - 0.34 * (d / TOP) ** 1.3), 0, 255)
    # blend the seam and give the made sky the photo's grain
    seam = canvas[TOP - 40 : TOP + 40].copy()
    canvas[TOP - 40 : TOP + 40] = cv2.GaussianBlur(seam, (0, 0), 9)
    noise = rng.normal(0, 2.2, (TOP, W, 1)).astype(np.float32)
    canvas[:TOP] += noise
    return np.clip(canvas, 0, 255).astype(np.uint8)


def sky_mask(real):
    b, g, r = [real[..., k].astype(np.float32) for k in range(3)]
    m = ((b > r * 1.25) & (b > 45) & (b >= g * 0.95)).astype(np.uint8)
    m[: TOP + 4] = 1
    m[1500:] = 0
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    # keep only the sky joined to the top of the frame
    n, lab = cv2.connectedComponents(m)
    keep = np.unique(lab[0])
    return np.isin(lab, keep[keep > 0]).astype(np.float32)


# the stars (x, y, size) and the moon; the two big swirls of the sky
STARS = [(170, 250, 1.0), (520, 170, 0.8), (330, 560, 1.15), (760, 420, 0.9), (150, 840, 0.8), (640, 760, 1.0), (930, 700, 0.75), (480, 960, 0.7)]
MOON = (890, 210, 1.7)
SWIRLS = [(430, 420, 150.0, 1.0), (700, 600, 110.0, -0.8)]


def flow(x, y, sky):
    """Unit direction of the brush at (x, y)."""
    vx = np.full_like(x, 1.0)
    vy = np.full_like(x, 0.12) + 0.25 * np.sin(x / 190.0 + y / 260.0)
    for sx, sy, a, g in SWIRLS:
        dx, dy = x - sx, y - sy
        r2 = dx * dx + dy * dy
        k = g * a * 3.2 / (r2 + a * a) * a
        vx += -dy * k / a
        vy += dx * k / a
    for sx, sy, s in STARS + [MOON]:
        dx, dy = x - sx, y - sy
        r2 = dx * dx + dy * dy
        a = 70.0 * s
        k = 2.4 * a / (r2 + a * a) * a
        vx += -dy * k / a
        vy += dx * k / a
    n = np.hypot(vx, vy) + 1e-6
    return vx / n, vy / n


def make_strokes(real, sky):
    """Fixed dabs: where, which way, what colour, how big."""
    gray = cv2.GaussianBlur(cv2.cvtColor(real, cv2.COLOR_BGR2GRAY).astype(np.float32), (0, 0), 3)
    gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=5)
    gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=5)
    hsv = cv2.cvtColor(real, cv2.COLOR_BGR2HSV).astype(np.float32)
    S = []
    # the sky on a coarser grid of dabs; the hotel on a finer one of small touches, so it still reads
    pts = [(x0, y0, 7, True) for y0 in range(-10, H + 10, 14) for x0 in range(-10, W + 10, 14)]
    pts += [(x0, y0, 4, False) for y0 in range(TOP, H + 8, 9) for x0 in range(-6, W + 8, 9)]
    for x0, y0, jit, want_sky in pts:
        x = float(np.clip(x0 + rng.uniform(-jit, jit), 0, W - 1))
        y = float(np.clip(y0 + rng.uniform(-jit, jit), 0, H - 1))
        xi, yi = int(x), int(y)
        is_sky = sky[yi, xi] > 0.5
        if is_sky != want_sky:
            continue
        hh, ss, vv = hsv[yi, xi]
        if is_sky:
            # broken colour: mostly Starry Night's blues in bands, with greens, violets and pale touches
            # beside them, and now and then a warm fleck
            band = np.sin(x / 140.0 + y / 90.0 + rng.uniform(-0.6, 0.6))
            vv = np.clip(vv * (0.6 + 0.3 * band + rng.uniform(-0.14, 0.16)), 16, 240)
            ss = np.clip(ss * 1.15 + 25 + rng.uniform(-25, 20), 0, 255)
            r = rng.random()
            if r < 0.07:
                hh, ss, vv = rng.uniform(18, 30), rng.uniform(120, 200), min(255, vv * 1.5 + 60)  # ochre
            elif r < 0.2:
                hh = rng.uniform(84, 96)  # towards green
            elif r < 0.3:
                hh = rng.uniform(122, 134)  # towards violet
            else:
                hh = np.clip(hh + rng.uniform(-7, 6), 98, 120)
            if rng.random() < 0.13:  # pale touches
                vv, ss = min(255, vv * 1.7 + 35), ss * 0.4
            length, width, travel = rng.uniform(20, 32), rng.uniform(11, 16), rng.uniform(45, 85)
            ang = 0.0
        else:
            ss = np.clip(ss * 1.3 + 10 + rng.uniform(-15, 15), 0, 255)
            vv = np.clip(vv * rng.uniform(0.88, 1.14) + 5, 0, 255)
            hh = hh + rng.uniform(-5, 5)
            if rng.random() < 0.06 and vv < 110:
                hh, ss = rng.uniform(100, 120), 150  # blue in the shadows
            length, width, travel = rng.uniform(11, 17), rng.uniform(8, 11), rng.uniform(2, 6)
            g = np.hypot(gx[yi, xi], gy[yi, xi])
            ang = np.arctan2(gx[yi, xi], -gy[yi, xi]) if g > 45 else 0.35 + rng.uniform(-0.3, 0.3)
        col = cv2.cvtColor(np.uint8([[[hh % 180, ss, vv]]]), cv2.COLOR_HSV2BGR)[0, 0]
        S.append((x, y, is_sky, ang, length, width, travel, rng.random(), rng.uniform(0.011, 0.02), *[float(c) for c in col],
                  rng.integers(0, NVAR), rng.uniform(0.2, 1.0)))
    S = np.array(S, np.float32)
    return S[rng.permutation(len(S))]


# ---- brush marks -------------------------------------------------------------------------------
NVAR, NANG = 8, 40
_BASE = []
_STAMPS = {}


def base_stamps():
    """A handful of brush marks, 96 x 48: ragged edge, bristle streaks, a thinner tail, a ridge of paint."""
    r_ = np.random.default_rng(21)
    yy, xx = np.mgrid[0:48, 0:96].astype(np.float32)
    u, v = (xx - 47.5) / 44.0, (yy - 23.5) / 20.0
    for _ in range(NVAR):
        edge = cv2.GaussianBlur(r_.normal(0, 1, (48, 96)).astype(np.float32), (0, 0), 4)
        edge /= np.abs(edge).max() + 1e-6
        d = np.abs(u) ** 2.4 + np.abs(v) ** 2.2 + edge * 0.42
        alpha = np.clip((1.0 - d) / 0.2, 0, 1)
        # bristles: streaks running the length of the mark, a little wavy
        rows = cv2.GaussianBlur(r_.normal(0, 1, (48, 1)).astype(np.float32), (0, 0), 1.1)
        rows = (rows - rows.min()) / (np.ptp(rows) + 1e-6)
        streak = np.repeat(rows, 96, axis=1)
        streak = cv2.GaussianBlur(streak + 0.25 * cv2.GaussianBlur(r_.normal(0, 1, (48, 96)).astype(np.float32), (0, 0), 2.5), (0, 0), 0.8)
        streak = np.clip(streak, 0, 1)
        tail = np.clip(1.15 - 0.55 * (u + 1) / 2 - 0.5 * streak * np.clip(u, 0, 1), 0, 1)  # the paint runs out
        alpha = alpha * np.clip(0.55 + 0.45 * tail + 0.2 * streak, 0, 1)
        ridge = np.exp(-(((1.0 - d) - 0.22) / 0.16) ** 2)
        height = alpha * (0.45 + 0.4 * streak + 0.5 * ridge)
        tone = 0.86 + 0.26 * streak
        _BASE.append((alpha.astype(np.float32), height.astype(np.float32), tone.astype(np.float32)))


def stamp(var, ang_i, lq, wq):
    """A base mark turned to one of NANG angles and scaled to (length, width) in pixels, cached."""
    key = (var, ang_i, lq, wq)
    st = _STAMPS.get(key)
    if st is None:
        a = 2 * np.pi * ang_i / NANG
        sx, sy = lq / 88.0, wq / 40.0
        size = int(max(lq, wq) + 6) | 1
        c = size / 2.0
        ca, sa = np.cos(a), np.sin(a)
        M = np.float32([[ca * sx, -sa * sy, c - (ca * sx * 47.5 - sa * sy * 23.5)], [sa * sx, ca * sy, c - (sa * sx * 47.5 + ca * sy * 23.5)]])
        al, hg, tn = _BASE[var]
        st = tuple(cv2.warpAffine(m, M, (size, size), flags=cv2.INTER_LINEAR, borderValue=0) for m in (al, hg)) + (
            cv2.warpAffine(tn, M, (size, size), flags=cv2.INTER_LINEAR, borderValue=1.0), size)
        _STAMPS[key] = st
    return st


def dab(img, hgt, x, y, ang, length, width, col, var, z):
    """Lay one mark: colour over what is there, and its thickness onto the paint."""
    lq, wq = int(max(6, length) / 2) * 2, int(max(4, width) / 2) * 2
    al, hg, tn, size = stamp(int(var), int(round(ang / (2 * np.pi) * NANG)) % NANG, lq, wq)
    x0, y0 = int(x - size / 2), int(y - size / 2)
    xa, ya, xb, yb = max(0, x0), max(0, y0), min(W, x0 + size), min(H, y0 + size)
    if xa >= xb or ya >= yb:
        return
    sl = (slice(ya, yb), slice(xa, xb))
    ss = (slice(ya - y0, yb - y0), slice(xa - x0, xb - x0))
    a = al[ss]
    a3 = a[..., None]
    img[sl] = img[sl] * (1 - a3) + (tn[ss][..., None] * col) * a3
    hgt[sl] = hgt[sl] * (1 - a) + (z + hg[ss]) * a


_DABS = {}


def star_dabs(key, s):
    """A star's halo as hand-laid dabs: rings that wobble, dabs of uneven size, weight and colour."""
    if key in _DABS:
        return _DABS[key]
    r_ = np.random.default_rng(100 + int(key[0]) * 7 + int(key[1]))
    rings = [(27, (170, 240, 255)), (48, (95, 215, 250)), (70, (120, 205, 225)), (93, (205, 185, 125))]
    out = []
    for i, (r, col) in enumerate(rings):
        n = max(7, int(2 * np.pi * r * s / 27))
        ph = r_.uniform(0, 6.28)
        for j in range(n):
            a = 2 * np.pi * j / n + r_.uniform(-0.1, 0.1)
            rr = r * (1 + r_.uniform(-0.08, 0.08) + 0.05 * np.sin(3 * a + ph))
            c = np.float32([np.clip(v * r_.uniform(0.82, 1.1) + r_.uniform(-12, 12), 0, 255) for v in col])
            if r_.random() < 0.12:
                c = np.float32([70, 150, 235])  # an orange touch
            out.append((i, a, rr, r_.uniform(20, 28), r_.uniform(12, 17), c, r_.uniform(-0.3, 0.3), r_.integers(0, NVAR), r_.uniform(0.6, 1.2)))
    _DABS[key] = out
    return out


def draw_star(img, hgt, x, y, s, t, born, core=(205, 246, 255)):
    k = smooth((t - born) / 12.0)
    if k <= 0:
        return
    for i, a0, rr, ln, wd, col, tilt, var, z in star_dabs((x, y), s):
        a = a0 + t * (0.03 - 0.005 * i) * (1 if i % 2 == 0 else -1)
        r = rr * s * k
        dab(img, hgt, x + np.cos(a) * r, y + np.sin(a) * r, a + np.pi / 2 + tilt, ln * s * (0.5 + 0.5 * k), wd * s * (0.5 + 0.5 * k), col, var, z)
    # the heart of it: a few thick touches, palest in the middle
    r_ = np.random.default_rng(int(x) * 3 + int(y))
    for j in range(7):
        a = 2 * np.pi * j / 7 + 0.4
        d = 8 * s * k
        c = np.float32(core) * r_.uniform(0.9, 1.0)
        dab(img, hgt, x + np.cos(a) * d, y + np.sin(a) * d, a + 1.2, 18 * s * k, 14 * s * k, c, j % NVAR, 1.3)
    dab(img, hgt, x, y, 0.5, 20 * s * k, 17 * s * k, np.float32([235, 252, 255]), 3, 1.6)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stills", default=None)
    ap.add_argument("--only", default=None, help="comma list of frames")
    ap.add_argument("--name", default=None, help="another hotel's picture: see VARIANTS")
    args = ap.parse_args()
    if args.name:
        global SRC, OUT, SCALE, CX, TOP, DOOR
        v = VARIANTS[args.name]
        SRC, OUT = ROOT / v["src"], ROOT / f"public/stings/starry-night-{args.name}.mp4"
        SCALE, CX, TOP, DOOR = v["scale"], v["cx"], v["top"], v["door"]

    base_stamps()
    real = build_real()
    sky = sky_mask(real)
    S = make_strokes(real, sky)
    dx_sky, dy_sky = flow(S[:, 0], S[:, 1], sky)
    is_sky = S[:, 2] > 0.5
    dirx = np.where(is_sky, dx_sky, np.cos(S[:, 3]))
    diry = np.where(is_sky, dy_sky, np.sin(S[:, 3]))
    ang = np.arctan2(diry, dirx)
    cols = S[:, 9:12].copy()
    under = cv2.GaussianBlur(real, (0, 0), 14).astype(np.float32)
    under *= np.where(sky[..., None] > 0.5, 0.5, 0.8)
    # the canvas: a fine weave, seen where the paint is thin
    wv = rng.normal(0, 1, (H, W)).astype(np.float32)
    weave = 1 + 0.035 * (cv2.GaussianBlur(wv, (0, 0), 0.9) / 0.4) + 0.02 * np.sin(np.arange(W)[None, :] * 1.9) * np.sin(np.arange(H)[:, None] * 1.9)

    # the clearing: distance from the doorway, its edge broken up
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    dist = np.hypot(xx - DOOR[0], yy - DOOR[1])
    nz = cv2.GaussianBlur(rng.normal(0, 1, (H // 8, W // 8)).astype(np.float32), (0, 0), 5)
    nz = cv2.resize(nz, (W, H), interpolation=cv2.INTER_CUBIC)
    nz = nz / (np.abs(nz).max() + 1e-6) * 170.0
    far = float(dist.max()) + 260

    frames = range(TOTAL) if not args.only else [int(v) for v in args.only.split(",")]
    proc = None
    if not args.stills:
        OUT.parent.mkdir(parents=True, exist_ok=True)
        proc = subprocess.Popen(
            ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
             "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(OUT)],
            stdin=subprocess.PIPE)
    n = len(S)
    for t in frames:
        m = None
        if t >= PAINT:
            R = smooth((t - PAINT) / CLEAR) ** 1.4 * far
            m = smooth((R - dist + nz) / 90.0)
        if m is not None and float(m.min()) >= 1:
            img = None
        else:
            img = under.copy()
            hgt = np.zeros((H, W), np.float32)
            u = (S[:, 7] + t * S[:, 8]) % 1.0
            sz = np.sin(np.pi * u) ** 0.6
            px = S[:, 0] + dirx * (u - 0.5) * S[:, 6]
            py = S[:, 1] + diry * (u - 0.5) * S[:, 6]
            ln = S[:, 4] * (0.55 + 0.45 * sz)
            wd = S[:, 5] * (0.5 + 0.5 * sz)
            for i in range(n):
                if sz[i] < 0.12:
                    continue
                dab(img, hgt, px[i], py[i], ang[i], ln[i], wd[i], cols[i], S[i, 12], S[i, 13])
            for k, (sx, sy, s) in enumerate(STARS):
                draw_star(img, hgt, sx, sy, s, t, 14 + k * 13)
            draw_star(img, hgt, *MOON, t, 4, core=(120, 215, 255))
            mk = smooth((t - 4) / 12.0)
            if mk > 0:  # the moon's crescent, laid on last
                for j in range(9):
                    a = -1.9 + j * 0.42
                    dab(img, hgt, MOON[0] + np.cos(a) * 22 * mk, MOON[1] + np.sin(a) * 22 * mk, a + np.pi / 2, 26 * mk, 18 * mk, np.float32([110, 205, 255]), j % NVAR, 1.5)
            # the paint's thickness lit from the top left, a glint on the ridges, the weave under it all
            hb = cv2.GaussianBlur(hgt, (0, 0), 0.8)
            relief = hb - np.roll(np.roll(hb, 2, axis=0), 2, axis=1)
            img *= (1 + np.clip(relief, -0.6, 0.6) * 0.75)[..., None]
            img += (np.clip(relief - 0.18, 0, 1) * 90)[..., None]
            img *= weave[..., None]
            img = np.clip(img, 0, 255)
        # the photograph underneath, pushing in slowly once it shows
        z = 1 + 0.06 * smooth(max(0, t - PAINT) / (TOTAL - PAINT))
        M = np.float32([[z, 0, (1 - z) * DOOR[0]], [0, z, (1 - z) * (DOOR[1] - 120)]])
        rl = cv2.warpAffine(real, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        if img is None:
            out = rl
        elif m is None:
            out = img.astype(np.uint8)
        else:
            out = (img * (1 - m[..., None]) + rl.astype(np.float32) * m[..., None]).astype(np.uint8)
        if args.stills:
            Path(args.stills).mkdir(parents=True, exist_ok=True)
            cv2.imwrite(f"{args.stills}/starry-{t:03d}.jpg", out)
        else:
            proc.stdin.write(out.tobytes())
        if t % 30 == 0:
            print("frame", t, file=sys.stderr)
    if proc:
        proc.stdin.close()
        proc.wait()
        print("wrote", OUT)


if __name__ == "__main__":
    main()
