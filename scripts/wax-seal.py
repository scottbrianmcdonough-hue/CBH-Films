#!/usr/bin/env python3
"""Render the wax seal brand moment's scene (cbh-wax-seal): a cream envelope lying on a dark
table under a warm light, gold sealing wax pooling on the tip of its flap, a brass seal coming
down from above the camera, pressing, and lifting off to leave the CB in the wax, then the
light moving across the relief so it glints. Nothing is a photo: the paper, the wax and the
seal are lit from height maps (the CB from public/brand/cbh-logo-cb-only.svg), so the
impression is the real outline. The world is drawn at 2x and the camera pushes in on it.

Writes public/stings/wax-seal.mp4 and prints where the CB sits on screen on the last frame,
for the Remotion composition (src/hotel-film/stings/WaxSeal.tsx) to take over from there.

Usage: scripts/wax-seal.py
"""
import json
import subprocess

import cv2
import numpy as np
from PIL import Image, ImageChops, ImageDraw
from scipy import ndimage as nd
from svgpathtools import svg2paths

ROOT = __file__.rsplit("/scripts/", 1)[0]
W, H = 1080, 1920  # the frame
WW, WH = 2160, 3840  # the world, at 2x
FRAMES = 270  # the camera and the light settle by 236; Remotion takes over from 240
rng = np.random.default_rng(11)


def smooth(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def ease_out(t):
    t = np.clip(t, 0, 1)
    return 1 - (1 - t) ** 3


def ease_in(t):
    t = np.clip(t, 0, 1)
    return t ** 2.2


def noise(shape, cell, seed):
    """Smooth value noise: random values on a coarse grid, resized up bicubically."""
    r = np.random.default_rng(seed)
    small = r.standard_normal((max(2, shape[0] // cell[0]), max(2, shape[1] // cell[1]))).astype(np.float32)
    return cv2.resize(small, (shape[1], shape[0]), interpolation=cv2.INTER_CUBIC)


# ---------------------------------------------------------------- the table and the envelope
yy, xx = np.mgrid[0:WH, 0:WW].astype(np.float32)

# dark walnut: grain running across, mostly in shadow
grain = 0.55 * noise((WH, WW), (6, 220), 1) + 0.3 * noise((WH, WW), (2, 60), 2) + 0.15 * noise((WH, WW), (40, 40), 3)
grain = 1 + 0.22 * grain
table = np.stack([0.075 * grain, 0.045 * grain, 0.026 * grain], -1)

ENV_C = np.array([1080.0, 1880.0])
ENV_ROT = np.deg2rad(-4.0)
EW, EH = 1000.0, 700.0  # half sizes
cr, sr = np.cos(ENV_ROT), np.sin(ENV_ROT)


def to_world(u, v):
    return ENV_C[0] + u * cr - v * sr, ENV_C[1] + u * sr + v * cr


# local (u, v) for every world pixel
uu = (xx - ENV_C[0]) * cr + (yy - ENV_C[1]) * sr
vv = -(xx - ENV_C[0]) * sr + (yy - ENV_C[1]) * cr


def soft_inside(d, w=1.2):
    return np.clip(0.5 + d / w, 0, 1)


env = soft_inside(np.minimum(EW - np.abs(uu), EH - np.abs(vv)))
TIP = np.array([0.0, 170.0])  # the top flap's point, local


def half_plane(p0, p1, side_point):
    """Signed distance to the line p0-p1, positive on the side of side_point."""
    d = np.array(p1) - np.array(p0)
    n = np.array([-d[1], d[0]]) / np.hypot(*d)
    s = np.sign((np.array(side_point) - np.array(p0)) @ n)
    return ((uu - p0[0]) * n[0] + (vv - p0[1]) * n[1]) * s


# the top flap: the triangle from the top corners to the tip
dl = half_plane((-EW, -EH), TIP, (EW, -EH))
dr = half_plane((EW, -EH), TIP, (-EW, -EH))
flap = soft_inside(np.minimum(np.minimum(dl, dr), EH + vv)) * env
# the bottom flap's creases, from the bottom corners up under the top flap
crease = np.zeros_like(uu)
for p0 in [(-EW, EH), (EW, EH)]:
    d = half_plane(p0, (0.0, 60.0), (0.0, EH))
    crease += np.exp(-(d / 2.2) ** 2) * (vv > -60)
crease *= env * (1 - flap)

fib = 0.022 * cv2.GaussianBlur(rng.standard_normal((WH, WW)).astype(np.float32), (0, 0), 1.1) / 0.25
fib += 0.03 * noise((WH, WW), (30, 30), 4)
paper = 1 + fib
paper_rgb = np.stack([0.80 * paper, 0.74 * paper, 0.62 * paper], -1)
paper_rgb *= (1 + 0.025 * flap)[..., None]
paper_rgb *= (1 - 0.18 * crease)[..., None]
# the flap's edges lie on the body: a soft shadow just below them
edge = np.exp(-(np.minimum(np.abs(dl), np.abs(dr)) / 3.0) ** 2) * (vv < TIP[1] + 4) * env
flap_shadow = cv2.GaussianBlur((flap > 0.5).astype(np.float32), (0, 0), 5)
flap_shadow = np.roll(np.roll(flap_shadow, 6, 0), 4, 1)
paper_rgb *= (1 - 0.16 * np.clip(flap_shadow - flap, 0, 1))[..., None]
paper_rgb *= (1 + 0.08 * edge)[..., None]

# the envelope's own shadow on the table
env_shadow = cv2.GaussianBlur(env, (0, 0), 26)
env_shadow = np.roll(np.roll(env_shadow, 26, 0), 18, 1)
table *= (1 - 0.6 * env_shadow)[..., None]

world_lin = table * (1 - env[..., None]) + paper_rgb * env[..., None]
# a warm pool of light, falling off into the dark
pool = 0.04 + 0.86 * np.exp(-(((xx - 1000) / 900) ** 2 + ((yy - 1860) / 980) ** 2))
world_lin *= pool[..., None] * np.array([1.0, 0.95, 0.86])

# ---------------------------------------------------------------- the seal and the wax
SEAL = np.array(to_world(*TIP)) + np.array([0.0, -20.0])  # the seal's centre, world
RS = 260.0  # the seal's face radius, world px
REG = int(RS * 3.2)  # half size of the region redrawn every frame
x0, y0 = int(SEAL[0]) - REG, int(SEAL[1]) - REG
ry, rx = np.mgrid[0:2 * REG, 0:2 * REG].astype(np.float32)
rx += x0 - SEAL[0]
ry += y0 - SEAL[1]
rr = np.hypot(rx, ry)
th = np.arctan2(ry, rx)

# the CB on the seal's face, fitted inside the face's inner ring
CB_BOX = (58.4, 0.0, 476.4, 451.5)
CB_K = 0.80 * RS / np.hypot((CB_BOX[2] - CB_BOX[0]) / 2, (CB_BOX[3] - CB_BOX[1]) / 2)
CB_O = (SEAL[0] - (CB_BOX[0] + CB_BOX[2]) / 2 * CB_K, SEAL[1] - (CB_BOX[1] + CB_BOX[3]) / 2 * CB_K)
SS = 4
m = Image.new("1", (2 * REG * SS, 2 * REG * SS), 0)
paths, _ = svg2paths(f"{ROOT}/public/brand/cbh-logo-cb-only.svg")
for path in paths:
    for sub in path.continuous_subpaths():
        pts = [sub.point(t) for t in np.linspace(0, 1, 1600)]
        layer = Image.new("1", m.size, 0)
        ImageDraw.Draw(layer).polygon(
            [((z.real * CB_K + CB_O[0] - x0) * SS, (z.imag * CB_K + CB_O[1] - y0) * SS) for z in pts], fill=1)
        m = ImageChops.logical_xor(m, layer)
cb = np.asarray(m.convert("L").resize((2 * REG, 2 * REG), Image.BOX), dtype=np.float32) / 255

lump = 1 + 0.05 * np.sin(3 * th + 0.7) + 0.035 * np.sin(5 * th + 2.1) + 0.02 * np.sin(9 * th + 4.0) \
    + 0.012 * np.sin(14 * th + 1.3)
micro = cv2.GaussianBlur(rng.standard_normal(rr.shape).astype(np.float32), (0, 0), 2.2) * 0.22

# the pour: dollops laid round a small circle, as if the stick were circled over the flap
DOLLOPS = []
for i in range(8):
    a = i * 2 * np.pi / 7 + 0.4
    rad = 0.0 if i == 7 else 0.42 * RS
    DOLLOPS.append((rad * np.cos(a), rad * np.sin(a), (0.5 if i < 7 else 0.55) * RS, 22 + i * 6))
POUR_LEN = 16


def puddle(f):
    mask = np.zeros(rr.shape, np.float32)
    for cx, cy, r, t0 in DOLLOPS:
        g = ease_out((f - t0) / POUR_LEN)
        if g <= 0:
            continue
        d = np.hypot(rx - cx, ry - cy)
        mask = np.maximum(mask, (d < r * g * lump).astype(np.float32))
    if mask.max() == 0:
        return np.zeros_like(mask)
    mask = cv2.GaussianBlur(mask, (0, 0), 7) > 0.5
    dist = nd.distance_transform_edt(mask).astype(np.float32)
    h = 20 * (1 - np.exp(-cv2.GaussianBlur(dist, (0, 0), 2.5) / 15))
    return cv2.GaussianBlur(h, (0, 0), 2.2) + micro * (h > 0.5)


def pressed(spread):
    """The wax once the seal has pressed it: a flat face with the CB raised, an inner ring,
    and the wax squeezed out round the edge in a lumpy ridge."""
    rout = RS * (1.0 + 0.24 * spread) * lump
    mask = rr < rout
    dist = nd.distance_transform_edt(mask).astype(np.float32)
    outer = 18 * (1 - np.exp(-cv2.GaussianBlur(dist, (0, 0), 2.5) / 13)) + 7 * np.exp(-((rr - RS * 1.05) / (RS * 0.05)) ** 2) * mask
    face = 12 + 6.5 * cv2.GaussianBlur(cb, (0, 0), 1.3)
    ring = 4.5 * np.exp(-((rr - RS * 0.9) / 3.2) ** 2)
    face = face + ring
    w = smooth((RS - rr) / 6 + 0.5)
    h = face * w + outer * (1 - w)
    return cv2.GaussianBlur(h, (0, 0), 0.9) + micro * 0.6 * mask


PRESSED = pressed(1.0)
GOLD = np.array([0.70, 0.43, 0.12])


def shade(h, light, glint=0.0):
    gy, gx = np.gradient(h)
    n = np.stack([-gx, -gy, np.ones_like(h)], -1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    L = np.array(light, np.float32)
    L /= np.linalg.norm(L)
    half = L + np.array([0, 0, 1.0])
    half /= np.linalg.norm(half)
    diff = np.clip(n @ L, 0, 1)
    nh = np.clip(n @ half, 0, 1)
    spec = 1.1 * nh ** 70 + 0.25 * nh ** 8
    ao = np.clip(1 - (cv2.GaussianBlur(h, (0, 0), 9) - h) * 0.035, 0.55, 1)
    # a metal-like wax: the colour is mostly the light it reflects
    env = 0.55 + 0.45 * np.clip(-n[..., 1] * 0.8 - n[..., 0] * 0.3 + 0.2, -1, 1)
    col = GOLD * (0.05 + 0.75 * diff[..., None] ** 1.3 + 0.22 * env[..., None]) * ao[..., None]
    col += spec[..., None] * np.array([1.0, 0.8, 0.48]) * (1.1 + glint)
    return col


def stamp_layer(scale, size):
    """The brass seal seen from above: its body (the face's back, turned brass with a bevel)
    and a turned walnut handle on top. Returns RGB and alpha, size x size screen px."""
    c = size / 2
    y, x = np.mgrid[0:size, 0:size].astype(np.float32) - c
    r = np.hypot(x, y)
    R = scale
    body = soft_inside(R - r, 1.5)
    turn = 1 + 0.05 * np.sin(r / max(R, 1) * 60)
    bevel = np.clip((r - R * 0.86) / (R * 0.14), 0, 1)
    lightdot = np.clip(-(x + y) / (np.hypot(x, y) + 1e-3), -1, 1)
    brass = np.array([0.42, 0.27, 0.08]) * (0.75 + 0.25 * turn)[..., None]
    brass = brass * (1 + 0.5 * bevel * lightdot)[..., None]
    hr = R * 0.6
    handle = soft_inside(hr - r, 1.5)
    hturn = 1 + 0.08 * np.sin(r / max(hr, 1) * 22)
    wood = np.array([0.09, 0.05, 0.025]) * hturn[..., None]
    hl = np.exp(-(((x + hr * 0.35) ** 2 + (y + hr * 0.4) ** 2) / (2 * (hr * 0.35) ** 2)))
    wood = wood + hl[..., None] * np.array([0.16, 0.1, 0.05])
    rim = np.exp(-((r - hr) / 3) ** 2)
    rgb = brass * (1 - handle[..., None]) + wood * handle[..., None]
    rgb *= (1 - 0.35 * rim)[..., None]
    return rgb, body


# ---------------------------------------------------------------- timeline
FADE_IN = (0, 24)
DESCEND = (78, 104)  # the seal comes down from above the camera
PRESS = (104, 112)
LIFT = (126, 152)
S_HIGH = 3.4  # how much bigger the seal looks at the top of its travel
GLINT = (150, 236)  # the light moves across the relief
END_ZOOM = 1.9


def camera(f):
    a = 1.0 + 0.12 * smooth(f / 110)
    b = smooth((f - 140) / 96)
    z = a + (END_ZOOM - a) * b
    c0 = np.array([WW / 2, 1940.0])
    c = c0 + (SEAL - c0) * smooth(f / 200)
    return z, c


def light_at(f):
    t = smooth((f - GLINT[0]) / (GLINT[1] - GLINT[0]))
    a = np.deg2rad(-140 + 85 * t)
    el = np.deg2rad(38 + 10 * np.sin(np.pi * t))
    return [np.cos(a) * np.cos(el), np.sin(a) * np.cos(el), np.sin(el)], 0.35 * np.sin(np.pi * t)


def seal_height(f):
    """How far above the wax the seal is, as its apparent scale (1 = touching)."""
    if f < DESCEND[0] - 6 or f >= LIFT[1] + 6:
        return None
    if f < DESCEND[1]:
        return 1 + (S_HIGH - 1) * (1 - ease_in((f - (DESCEND[0] - 6)) / (DESCEND[1] - DESCEND[0] + 6)))
    if f < LIFT[0]:
        return 1 - 0.012 * np.sin(np.pi * np.clip((f - PRESS[0]) / (PRESS[1] - PRESS[0]), 0, 1))
    return 1 + (S_HIGH - 1) * smooth((f - LIFT[0]) / (LIFT[1] - LIFT[0] + 6))


def to_srgb(lin):
    return np.clip(lin, 0, 1) ** (1 / 2.2)


world8 = (to_srgb(world_lin) * 255).astype(np.uint8)
base_patch = world_lin[y0:y0 + 2 * REG, x0:x0 + 2 * REG].copy()

out = f"{ROOT}/public/stings/wax-seal.mp4"
enc = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", "30",
     "-i", "-", "-c:v", "libx264", "-crf", "15", "-preset", "slow", "-pix_fmt", "yuv420p", out],
    stdin=subprocess.PIPE)
import os
ONLY = [int(v) for v in os.environ.get("ONLY", "").split(",") if v]  # check frames as stills
for f in (ONLY or range(FRAMES)):
    s = seal_height(f)
    pressed_now = f >= PRESS[0]
    if pressed_now:
        h = PRESSED if f >= PRESS[1] else pressed(ease_out((f - PRESS[0]) / (PRESS[1] - PRESS[0])))
    else:
        h = puddle(f)
    light, glint = light_at(f)
    alpha = np.clip(h / 1.6, 0, 1)[..., None]
    wax = shade(h, light, glint)
    patch = base_patch.copy()
    # the wax's contact shadow on the paper
    sh = cv2.GaussianBlur(alpha[..., 0], (0, 0), 6)
    sh = np.roll(np.roll(sh, 7, 0), 5, 1)
    patch *= (1 - 0.4 * sh)[..., None]
    # the seal's shadow, sharpening as it comes down
    if s is not None:
        k = max(0.0, (s - 1) / (S_HIGH - 1))
        sd = np.hypot(rx - 60 * k - 6, ry - 80 * k - 8)
        shadow = soft_inside(RS * (1 + 0.35 * k) - sd, 4 + 70 * k)
        patch *= (1 - (0.55 - 0.35 * k) * shadow)[..., None]
    patch = patch * (1 - alpha) + wax * pool[y0:y0 + 2 * REG, x0:x0 + 2 * REG, None] * alpha
    world8[y0:y0 + 2 * REG, x0:x0 + 2 * REG] = (to_srgb(patch) * 255).astype(np.uint8)

    z, c = camera(f)
    sc = z * W / WW
    M = np.array([[sc, 0, W / 2 - c[0] * sc], [0, sc, H / 2 - c[1] * sc]], np.float32)
    src = world8 if sc > 0.75 else cv2.GaussianBlur(world8, (0, 0), 0.5 / sc - 0.5)
    frame = cv2.warpAffine(src, M, (W, H), flags=cv2.INTER_LINEAR).astype(np.float32) / 255
    if s is not None:
        # the seal itself, between the camera and the table: bigger and softer the higher it is
        k = max(0.0, (s - 1) / (S_HIGH - 1))
        R = RS * sc * s
        size = int(2 * R + 160 * (1 + 2 * k))
        rgb, a = stamp_layer(R, size)
        blur = 0.5 + 16 * k ** 1.4
        rgb = cv2.GaussianBlur(rgb.astype(np.float32), (0, 0), blur)
        a = cv2.GaussianBlur(a.astype(np.float32), (0, 0), blur)
        # perspective: higher means further out from the frame's centre
        p = (SEAL - c) * sc * s + np.array([W / 2, H / 2])
        X0, Y0 = int(p[0] - size / 2), int(p[1] - size / 2)
        fx0, fy0 = max(0, X0), max(0, Y0)
        fx1, fy1 = min(W, X0 + size), min(H, Y0 + size)
        if fx1 > fx0 and fy1 > fy0:
            sub = (slice(fy0 - Y0, fy1 - Y0), slice(fx0 - X0, fx1 - X0))
            pool_s = 0.55 + 0.45 * (1 - k)  # it comes out of the dark above the light
            aa = a[sub][..., None] * smooth((S_HIGH - s) / 0.6)  # in and out of the blur, never popping
            frame[fy0:fy1, fx0:fx1] = frame[fy0:fy1, fx0:fx1] * (1 - aa) + to_srgb(rgb[sub] * pool_s) * aa
    fade = smooth((f - FADE_IN[0]) / (FADE_IN[1] - FADE_IN[0]))
    frame *= fade
    if ONLY:
        Image.fromarray((np.clip(frame, 0, 1) * 255).astype(np.uint8)).save(f"{os.environ['STILLS']}/wax-{f:03d}.png")
    else:
        enc.stdin.write((np.clip(frame, 0, 1) * 255).astype(np.uint8).tobytes())
    world8[y0:y0 + 2 * REG, x0:x0 + 2 * REG] = (to_srgb(base_patch) * 255).astype(np.uint8)
    if f % 30 == 0:
        print("frame", f, flush=True)
enc.stdin.close()
enc.wait()

z, c = camera(FRAMES - 1)
sc = z * W / WW
place = {
    "scale": round(float(CB_K * sc), 5),  # screen px per logo viewBox unit
    "origin": [round(float((CB_O[0] - c[0]) * sc + W / 2), 2), round(float((CB_O[1] - c[1]) * sc + H / 2), 2)],
}
print(out, FRAMES, "frames; the CB on the last frame:", json.dumps(place))
