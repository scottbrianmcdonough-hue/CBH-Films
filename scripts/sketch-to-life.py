#!/usr/bin/env python3
"""Sketch to life: a photo drawn in phases on cream paper, then washed into colour.

The drawing is built from the photo itself, stroke by stroke (not a filter):
  1. pencil  - light construction lines: the long straight edges, overshooting their
               corners like an architect's guidelines
  2. ink     - outlines traced from the photo's edges, main lines first, growing out
               from the focal point, then the details
  3. hatch   - cross-hatching laid into the shadows, swept diagonally, denser where darker
  4. colour  - a slow watercolour wash blooming out from the focal point (soft, uneven
               edges with pigment pooling at the front), the lines still on top
  5. life    - the wash settles into the real photo and the lines lift away; the photo
               then holds with a barely-there push

Output: a 1080x1920 30fps H.264 clip (muted) for the Remotion `sketch` engine.

  scripts/sketch-to-life.py photo.jpg out.mp4 --x 48 --frames 420 \
      --pencil 0 70 --ink 60 190 --hatch 180 240 --colour 240 330 --life 320 360

Phase times are frames. Needs numpy, opencv-python-headless, scikit-image.
"""

import argparse
import math
import subprocess

import cv2
import numpy as np
from skimage.morphology import skeletonize

W, H, S = 1080, 1920, 2  # frame size, supersampling for the line work

PAPER = np.array([243, 237, 225], np.float32)  # warm cream (RGB)
INK = np.array([30, 26, 22], np.float32)  # brown-black ink
PENCIL = np.array([120, 116, 110], np.float32)


def cover_crop(img, x, y):
    h, w = img.shape[:2]
    k = max(W / w, H / h)
    rw, rh = round(w * k), round(h * k)
    img = cv2.resize(img, (rw, rh), interpolation=cv2.INTER_AREA)
    ox = round((rw - W) * x / 100)
    oy = round((rh - H) * y / 100)
    img = img[oy : oy + H, ox : ox + W]
    if k > 1.3:
        # A web-sized still enlarged for 9:16 reads soft: a gentle unsharp mask.
        soft = cv2.GaussianBlur(img, (0, 0), 2.2)
        img = cv2.addWeighted(img, 1.6, soft, -0.6, 0)
    return img


def poly_len(p):
    return float(np.sum(np.hypot(*np.diff(p, axis=0).T))) if len(p) > 1 else 0.0


def trace(skel):
    """Walk a 1px skeleton into polylines (endpoints first, then loops)."""
    ys, xs = np.nonzero(skel)
    pix = set(zip(ys.tolist(), xs.tolist()))
    nb = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]

    def neighbours(p):
        return [(p[0] + dy, p[1] + dx) for dy, dx in nb if (p[0] + dy, p[1] + dx) in pix]

    seen = set()
    lines = []
    ends = [p for p in pix if len(neighbours(p)) == 1]
    for start in ends + list(pix):
        if start in seen:
            continue
        path = [start]
        seen.add(start)
        cur = start
        while True:
            nxt = [q for q in neighbours(cur) if q not in seen]
            if not nxt:
                break
            # Prefer straight-on neighbours (4-connected) to keep the walk smooth.
            nxt.sort(key=lambda q: abs(q[0] - cur[0]) + abs(q[1] - cur[1]))
            cur = nxt[0]
            seen.add(cur)
            path.append(cur)
        if len(path) > 1:
            lines.append(np.array([[x, y] for y, x in path], np.float32))
    return lines


def simplify(p, eps):
    if len(p) < 3:
        return p
    return cv2.approxPolyDP(p.reshape(-1, 1, 2), eps, False).reshape(-1, 2)


def wobble(p, rng, amp):
    """A hand's tremor: a smooth, low-frequency offset along the line."""
    if len(p) < 2 or amp <= 0:
        return p
    n = len(p)
    ph = rng.uniform(0, 2 * math.pi, 2)
    t = np.linspace(0, 1, n)
    off = np.stack(
        [np.sin(t * 3.1 + ph[0]), np.sin(t * 2.7 + ph[1])], axis=1
    ).astype(np.float32)
    return p + off * amp


def densify(p, step=6.0):
    out = [p[0]]
    for a, b in zip(p[:-1], p[1:]):
        d = float(np.hypot(*(b - a)))
        k = max(1, int(d // step))
        for i in range(1, k + 1):
            out.append(a + (b - a) * i / k)
    return np.array(out, np.float32)


def pencil_strokes(gray, rng):
    edges = cv2.Canny(cv2.GaussianBlur(gray, (0, 0), 2.5), 30, 90)
    found = cv2.HoughLinesP(
        edges, 1, np.pi / 360, threshold=70, minLineLength=150, maxLineGap=14
    )
    segs = []
    found = found if found is not None else np.zeros((0, 4), np.int32)
    for x1, y1, x2, y2 in found.reshape(-1, 4).tolist():
        ang = math.degrees(math.atan2(y2 - y1, x2 - x1)) % 180
        straight = min(ang, abs(ang - 90), abs(180 - ang)) < 6
        segs.append((math.hypot(x2 - x1, y2 - y1) * (1.5 if straight else 1), x1, y1, x2, y2))
    segs.sort(reverse=True)
    kept = []
    for _, x1, y1, x2, y2 in segs:
        mid = np.array([(x1 + x2) / 2, (y1 + y2) / 2])
        if any(np.hypot(*(mid - k[2])) < 24 for k in kept):
            continue
        d = np.array([x2 - x1, y2 - y1], np.float32)
        d /= np.linalg.norm(d) + 1e-6
        over = rng.uniform(22, 60, 2)  # overshoot past each corner
        a = np.array([x1, y1], np.float32) - d * over[0]
        b = np.array([x2, y2], np.float32) + d * over[1]
        kept.append((a, b, mid))
        if len(kept) >= 80:
            break
    guides = [densify(np.stack([a, b])) for a, b, _ in kept]
    # Loose underdrawing: the outlines of the big tonal shapes (iso-lines of a heavily
    # softened image), each drawn twice, a little apart, the way a pencil feels its way
    # round a form.
    soft = cv2.GaussianBlur(gray, (0, 0), 6)
    loose = []
    for pct in (22, 45, 70):
        level = np.percentile(soft, pct)
        cs, _ = cv2.findContours(
            (soft < level).astype(np.uint8), cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE
        )
        for c in cs:
            p = simplify(c.reshape(-1, 2).astype(np.float32), 4)
            if poly_len(p) < 90:
                continue
            p = densify(p, 8)
            loose.append(wobble(p, rng, 2.5))
            loose.append(wobble(p + rng.normal(0, 2.2, 2).astype(np.float32), rng, 3))
    loose.sort(key=poly_len, reverse=True)
    return guides + loose[:160]


def ink_strokes(gray, rng, min_len=12, cap=3200, blur=0.0):
    smooth = cv2.bilateralFilter(gray, 9, 50, 7)
    if blur:
        # Busy scenes: soften texture (stone, leaves, carpet) so only real lines survive.
        smooth = cv2.GaussianBlur(cv2.bilateralFilter(smooth, 9, 60, 9), (0, 0), blur)
    med = float(np.median(smooth))
    edges = cv2.Canny(smooth, 0.4 * med, 1.0 * med)
    skel = skeletonize(edges > 0)
    lines = []
    for p in trace(skel):
        p = simplify(p, 1.1)
        if poly_len(p) < min_len:
            continue
        lines.append(wobble(densify(p, 5), rng, 0.7))
    lines.sort(key=poly_len, reverse=True)
    return lines[:cap]


def hatch_strokes(gray, rng, region=None, pcts=(55, 35, 18), min_run=5):
    tone = cv2.GaussianBlur(gray.astype(np.float32) / 255, (0, 0), 5)
    vals = tone[region] if region is not None else tone
    out = []
    # (tone percentile, angle in degrees, spacing): darker tones gather more layers.
    for pct, ang, gap in zip(pcts, (45, 135, 60), (8, 8, 6)):
        thr = float(np.percentile(vals, pct))
        mask = tone < thr
        a = math.radians(ang)
        d = np.array([math.cos(a), math.sin(a)])  # along the hatch
        n = np.array([-d[1], d[0]])  # across
        diag = math.hypot(W, H)
        for off in np.arange(-diag, diag, gap):
            base = np.array([W / 2, H / 2]) + n * off
            ts = np.arange(-diag / 2, diag / 2, 3.0)
            pts = base[None, :] + ts[:, None] * d[None, :]
            inside = (pts[:, 0] >= 0) & (pts[:, 0] < W) & (pts[:, 1] >= 0) & (pts[:, 1] < H)
            on = np.zeros(len(ts), bool)
            ip = pts[inside].astype(int)
            on[inside] = mask[ip[:, 1], ip[:, 0]]
            # Runs of `on` become strokes, trimmed a little at random like a hand would.
            edges_ = np.diff(np.concatenate([[0], on.astype(int), [0]]))
            for s, e in zip(np.nonzero(edges_ == 1)[0], np.nonzero(edges_ == -1)[0]):
                if e - s < min_run:
                    continue
                s2 = s + rng.integers(0, 3)
                e2 = e - rng.integers(0, 3)
                if e2 - s2 < 4:
                    continue
                seg = pts[[s2, e2 - 1]].astype(np.float32)
                seg += rng.normal(0, 0.6, seg.shape).astype(np.float32)
                out.append(densify(seg, 8))
    return out[:8000]


def schedule(strokes, a, b, speed, order):
    """Start/end frames for each stroke: several pens at once, all done by frame b."""
    n = len(strokes)
    idx = np.argsort(order) if n else []
    plan = [None] * n
    for rank, i in enumerate(idx):
        d = float(np.clip(poly_len(strokes[i]) / speed, 3, 16))
        f = rank / max(1, n - 1)
        start = a + (b - a - d) * f
        plan[i] = (start, start + d)
    return plan


def partial(p, frac):
    if frac >= 1:
        return p
    seg = np.hypot(*np.diff(p, axis=0).T)
    cum = np.concatenate([[0], np.cumsum(seg)])
    target = cum[-1] * frac
    k = int(np.searchsorted(cum, target))
    if k <= 0:
        return p[:1]
    t = (target - cum[k - 1]) / max(seg[k - 1], 1e-6)
    return np.vstack([p[:k], p[k - 1] + (p[k] - p[k - 1]) * t])


def draw(mask, p, thick):
    if len(p) < 2:
        return
    pts = np.round(p * S * 8).astype(np.int32).reshape(-1, 1, 2)
    cv2.polylines(mask, [pts], False, 255, thick, cv2.LINE_AA, shift=3)


def smoothstep(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("photo")
    ap.add_argument("out")
    ap.add_argument("--x", type=float, default=50)
    ap.add_argument("--y", type=float, default=50)
    ap.add_argument("--focus", type=float, nargs=2, default=None, help="x y in frame px")
    ap.add_argument("--frames", type=int, required=True)
    for ph in ["pencil", "ink", "hatch", "colour", "life"]:
        ap.add_argument(f"--{ph}", type=float, nargs=2, required=True)
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--ink-min", type=float, default=12, help="shortest ink line, px")
    ap.add_argument("--ink-max", type=int, default=3200, help="most ink lines")
    ap.add_argument("--ink-blur", type=float, default=0, help="soften texture first (scenes)")
    ap.add_argument("--hatch-pct", type=str, default="55,35,18", help="tone percentiles")
    ap.add_argument("--hatch-run", type=int, default=5, help="shortest hatch, in 3px steps")
    ap.add_argument("--mask", type=str, default=None, help="white = subject: ink and hatch only there")
    ap.add_argument("--preview", type=str, default=None, help="write these frames as PNGs")
    args = ap.parse_args()
    rng = np.random.default_rng(args.seed)

    bgr = cover_crop(cv2.imread(args.photo), args.x, args.y)
    photo = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB).astype(np.float32)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    fx, fy = args.focus or (W / 2, H * 0.55)

    pencil = pencil_strokes(gray, rng)
    ink = ink_strokes(gray, rng, args.ink_min, args.ink_max, args.ink_blur)
    sub = cv2.imread(args.mask, cv2.IMREAD_GRAYSCALE) > 127 if args.mask else None
    pcts = tuple(float(v) for v in args.hatch_pct.split(","))
    hatch = hatch_strokes(gray, rng, sub, pcts, args.hatch_run)
    if args.mask:

        def keep(ps, share=0.8):
            out = []
            for p in ps:
                q = np.clip(np.round(p).astype(int), 0, [W - 1, H - 1])
                if sub[q[:, 1], q[:, 0]].mean() > share:
                    out.append(p)
            return out

        pencil, ink, hatch = keep(pencil, 0.6), keep(ink), keep(hatch)
    # The pencil also roughs in the main lines the ink will follow, looser and simpler.
    pencil += [
        wobble(densify(simplify(p, 4), 8), rng, 2.5) for p in ink if poly_len(p) >= 45
    ][:220]
    major = [p for p in ink if poly_len(p) >= 80]
    detail = [p for p in ink if poly_len(p) < 80]
    print(f"pencil {len(pencil)}, ink {len(major)}+{len(detail)}, hatch {len(hatch)}")

    def centre_out(ps, jitter):
        return [
            math.hypot(*(p.mean(0) - (fx, fy))) + rng.uniform(0, jitter) for p in ps
        ]

    pa, pb = args.pencil
    ia, ib = args.ink
    split = ia + (ib - ia) * 0.55
    layers = [
        # (strokes, plan, layer, thickness at 2x)
        (pencil, schedule(pencil, pa, pb, 40, [-poly_len(p) for p in pencil]), 0, 2),
        (major, schedule(major, ia, split, 22, centre_out(major, 160)), 1, 4),
        (detail, schedule(detail, ia + (ib - ia) * 0.3, ib, 14, centre_out(detail, 220)), 1, 3),
        (hatch, schedule(hatch, *args.hatch, 30, [p[:, 0].mean() + p[:, 1].mean() + rng.uniform(0, 260) for p in hatch]), 2, 2),
    ]
    events = []  # (end frame, layer, stroke, thickness): commit when finished
    for strokes, plan, layer, thick in layers:
        for p, (s, e) in zip(strokes, plan):
            events.append((s, e, layer, p, thick))
    events.sort(key=lambda ev: ev[1])

    committed = [np.zeros((H * S, W * S), np.uint8) for _ in range(3)]
    done = 0

    # Paper: cream with a fine tooth and a soft vignette.
    tooth = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 0.8)
    paper = PAPER[None, None, :] * (1 + 0.025 * tooth[..., None])
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    vig = 1 - 0.08 * (((xx - W / 2) / W) ** 2 + ((yy - H / 2) / H) ** 2) * 4
    paper *= vig[..., None]

    # The watercolour: the photo lightened and simplified, laid onto the paper.
    wash = cv2.cvtColor(
        cv2.bilateralFilter(cv2.GaussianBlur(bgr, (0, 0), 1.5), 9, 40, 9), cv2.COLOR_BGR2RGB
    ).astype(np.float32)
    wash = 255 - (255 - wash) * 0.72  # a lighter, translucent pigment
    wash = paper * wash / 255

    # When each pixel takes the wash: out from the focal point, with an uneven,
    # blooming edge from low-frequency noise.
    noise = cv2.GaussianBlur(rng.normal(0, 1, (H // 8, W // 8)).astype(np.float32), (0, 0), 3)
    noise = cv2.resize(noise, (W, H), interpolation=cv2.INTER_CUBIC)
    noise = (noise - noise.min()) / (np.ptp(noise) + 1e-6)
    dist = np.hypot(xx - fx, yy - fy)
    reveal = 0.7 * dist / dist.max() + 0.3 * noise
    reveal = (reveal - reveal.min()) / (np.ptp(reveal) + 1e-6)
    if sub is not None:
        # The subject takes the wash first, blooming; the background follows late and
        # evenly, so it never reads as stains on the paper.
        w = cv2.GaussianBlur(sub.astype(np.float32), (0, 0), 25)[..., None][..., 0]
        bg = 0.8 + 0.2 * dist / dist.max()
        reveal = w * reveal * 0.75 + (1 - w) * bg

    ff = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{W}x{H}", "-r", "30", "-i", "-", "-c:v", "libx264", "-preset", "medium",
         "-crf", "15", "-pix_fmt", "yuv420p", args.out],
        stdin=subprocess.PIPE,
    )
    previews = {int(v) for v in args.preview.split(",")} if args.preview else set()
    ca, cb = args.colour
    la, lb = args.life
    for f in range(args.frames):
        while done < len(events) and events[done][1] <= f:
            _, _, layer, p, thick = events[done]
            draw(committed[layer], p, thick)
            done += 1
        masks = [m.copy() for m in committed]
        for s, e, layer, p, thick in events[done:]:
            if s < f < e:
                draw(masks[layer], partial(p, (f - s) / (e - s)), thick)
        a = [
            cv2.resize(m, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32)[..., None] / 255
            for m in masks
        ]
        # Colour wash beneath the lines.
        pc = smoothstep((f - ca) / max(cb - ca, 1))
        if pc > 0:
            aw = smoothstep((pc * 1.35 - reveal) / 0.35)[..., None]
            front = 4 * aw * (1 - aw)  # pigment pools at the wet edge
            base = paper * (1 - aw) + wash * aw
            base *= 1 - 0.12 * front
        else:
            base = paper
        img = base * (1 - 0.30 * a[0]) + PENCIL * 0.30 * a[0]
        img = img * (1 - 0.55 * a[2]) + INK * 0.55 * a[2]
        img = img * (1 - 0.9 * a[1]) + INK * 0.9 * a[1]
        # To life: a second, slower wave. The photo develops out from the focal point
        # through the watercolour and the lines lift away where it arrives, so nothing
        # snaps (Scott: the reveal came "in a flash"). From then on the whole frame holds
        # with a slow push (applied to the composite, so lines and photo stay in register).
        pl = smoothstep((f - la) / max(lb - la, 1))
        if pl > 0:
            al = smoothstep((pl * 1.4 - reveal) / 0.4)[..., None]
            img = img * (1 - al) + photo * al
        if f > la:
            push = 1 + 0.03 * (f - la) / max(args.frames - la, 1)
            m = cv2.getRotationMatrix2D((W / 2, H / 2), 0, push)
            img = cv2.warpAffine(
                img, m, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT
            )
        frame = np.clip(img, 0, 255).astype(np.uint8)
        ff.stdin.write(frame.tobytes())
        if f in previews:
            cv2.imwrite(f"{args.out}.{f}.png", cv2.cvtColor(frame, cv2.COLOR_RGB2BGR))
    ff.stdin.close()
    ff.wait()


if __name__ == "__main__":
    main()
