#!/usr/bin/env python3
"""Starry Night, but a CBH hotel (Scott, 16 Nov: TikTok "animation stuff like the starry night").

A dusk photo of a hotel repainted in moving brush strokes: the sky a field of short dabs flowing round
swirls and round each star, the stars and a moon coming out one by one inside their rings of dashes, the
hotel in thicker dabs that barely stir. Then the paint clears outwards from the lit doorway and it is the
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
    step = 15
    for y0 in range(-10, H + 10, step):
        for x0 in range(-10, W + 10, step):
            x = float(np.clip(x0 + rng.uniform(-7, 7), 0, W - 1))
            y = float(np.clip(y0 + rng.uniform(-7, 7), 0, H - 1))
            xi, yi = int(x), int(y)
            is_sky = sky[yi, xi] > 0.5
            hh, ss, vv = hsv[yi, xi]
            if is_sky:
                # the sky in Starry Night's blues: deeper and more saturated than the photo, in bands
                band = np.sin(x / 140.0 + y / 90.0 + rng.uniform(-0.6, 0.6))
                vv = np.clip(vv * (0.62 + 0.28 * band + rng.uniform(-0.1, 0.12)), 18, 235)
                ss = np.clip(ss * 1.15 + 25, 0, 255)
                hh = np.clip(hh + rng.uniform(-6, 5), 96, 122)
                if rng.random() < 0.12:  # pale streaks
                    vv, ss = min(255, vv * 1.7 + 30), ss * 0.45
                length, width, travel = rng.uniform(34, 58), rng.uniform(9, 14), rng.uniform(50, 90)
                ang = None
            else:
                ss = np.clip(ss * 1.35 + 12, 0, 255)
                vv = np.clip(vv * rng.uniform(0.86, 1.2) + 6, 0, 255)
                hh = hh + rng.uniform(-3, 3)
                length, width, travel = rng.uniform(16, 30), rng.uniform(7, 11), rng.uniform(4, 10)
                g = np.hypot(gx[yi, xi], gy[yi, xi])
                # along the edges where there are any, else a loose slant
                ang = np.arctan2(gx[yi, xi], -gy[yi, xi]) if g > 60 else rng.uniform(-0.5, 0.5)
            col = cv2.cvtColor(np.uint8([[[hh % 180, ss, vv]]]), cv2.COLOR_HSV2BGR)[0, 0]
            S.append((x, y, is_sky, ang if ang is not None else 0.0, length, width, travel, rng.random(), rng.uniform(0.012, 0.022), *[int(c) for c in col]))
    S = np.array(S, np.float32)
    S = S[rng.permutation(len(S))]
    return S


def draw_star(img, x, y, s, t, born):
    k = smooth((t - born) / 12.0)
    if k <= 0:
        return
    rings = [(24, (150, 235, 255)), (44, (90, 215, 250)), (64, (120, 200, 215)), (86, (190, 170, 110))]
    for i, (r, col) in enumerate(rings):
        r = r * s * k
        n = max(8, int(2 * np.pi * r / 26))
        for j in range(n):
            a = 2 * np.pi * j / n + t * (0.035 - 0.006 * i) * (1 if i % 2 == 0 else -1) + i
            c, sn = np.cos(a), np.sin(a)
            p = (x + c * r, y + sn * r)
            d = 9 * s
            cv2.line(img, (int(p[0] + sn * d), int(p[1] - c * d)), (int(p[0] - sn * d), int(p[1] + c * d)), col, max(2, int(7 * s)), cv2.LINE_AA)
    cv2.circle(img, (int(x), int(y)), int(13 * s * k), (200, 245, 255), -1, cv2.LINE_AA)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stills", default=None)
    ap.add_argument("--only", default=None, help="comma list of frames")
    args = ap.parse_args()

    real = build_real()
    sky = sky_mask(real)
    S = make_strokes(real, sky)
    dx_sky, dy_sky = flow(S[:, 0], S[:, 1], sky)
    is_sky = S[:, 2] > 0.5
    dirx = np.where(is_sky, dx_sky, np.cos(S[:, 3]))
    diry = np.where(is_sky, dy_sky, np.sin(S[:, 3]))
    under = cv2.GaussianBlur(real, (0, 0), 14)
    under = (under.astype(np.float32) * np.where(sky[..., None] > 0.5, 0.6, 0.9)).astype(np.uint8)

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
    for t in frames:
        m = None
        if t >= PAINT:
            R = smooth((t - PAINT) / CLEAR) ** 1.4 * far
            m = smooth((R - dist + nz) / 90.0)
        if m is not None and float(m.min()) >= 1:
            img = None
        else:
            img = under.copy()
            u = (S[:, 7] + t * S[:, 8]) % 1.0
            sz = np.sin(np.pi * u) ** 0.6
            px = S[:, 0] + dirx * (u - 0.5) * S[:, 6]
            py = S[:, 1] + diry * (u - 0.5) * S[:, 6]
            hl = S[:, 4] * sz / 2
            ax, ay, bx, by = px - dirx * hl, py - diry * hl, px + dirx * hl, py + diry * hl
            th = np.maximum(2, S[:, 5] * (0.45 + 0.55 * sz)).astype(np.int32)
            for i in range(len(S)):
                cv2.line(img, (int(ax[i]), int(ay[i])), (int(bx[i]), int(by[i])), (int(S[i, 9]), int(S[i, 10]), int(S[i, 11])), int(th[i]), cv2.LINE_AA)
            for k, (sx, sy, s) in enumerate(STARS):
                draw_star(img, sx, sy, s, t, 14 + k * 13)
            # the moon: a crescent in its rings
            draw_star(img, *MOON, t, 4)
            mk = smooth((t - 4) / 12.0)
            if mk > 0:
                cv2.circle(img, (MOON[0], MOON[1]), int(30 * mk), (120, 215, 255), -1, cv2.LINE_AA)
                cv2.circle(img, (MOON[0] + 13, MOON[1] - 6), int(24 * mk), (190, 240, 255), -1, cv2.LINE_AA)
        # the photograph underneath, pushing in slowly once it shows
        z = 1 + 0.06 * smooth(max(0, t - PAINT) / (TOTAL - PAINT))
        M = np.float32([[z, 0, (1 - z) * DOOR[0]], [0, z, (1 - z) * (DOOR[1] - 120)]])
        rl = cv2.warpAffine(real, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        if img is None:
            out = rl
        elif m is None:
            out = img
        else:
            out = (img.astype(np.float32) * (1 - m[..., None]) + rl.astype(np.float32) * m[..., None]).astype(np.uint8)
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
