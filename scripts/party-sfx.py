#!/usr/bin/env python3
"""Subtle sound effects for cbh-christmas-party (Scott: "add subtle sound effects").
Synthesised, no samples: a paper flick as each page lifts away, a soft shutter as each page's first photo cuts in,
and a few touches on the drawings (the sticker's pat, the dice on the table, the slap, a pop on "Party time!",
a small pluck as the u comes loose). Frame times mirror PARTY in src/hotel-film/doodle/StickFlip.tsx:
rerun after retiming it. Writes public/campaigns/xmas-party-2026/party-sfx.mp3 (played from frame 0)."""
import subprocess, numpy as np
from scipy.signal import butter, lfilter
SR, FPS = 48000, 30
SCENES = [150, 255, 315, 420, 870, 1020, 1125, 1230, 1440, 1530]
LAST = 1620  # the goodbye page: a drawing only, no photo
WAITER = 750  # the waiter and the tables, a run of photos before the 8:00pm page  # where each page starts
END, TOTAL = 1680, 1790
GAG = 8  # a page's drawing runs FLIP frames behind its scene
rng = np.random.default_rng(7)
out = np.zeros((int(TOTAL / FPS * SR) + SR, 2))

def bp(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band"); return lfilter(b, a, x)
def noise(n): return rng.standard_normal(n)
def env(n, a, d):
    t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def put(x, frame, db, pan=0.0):
    x = x / (np.abs(x).max() + 1e-9) * 10 ** (db / 20)
    i = int(frame / FPS * SR); l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    out[i:i + len(x), 0] += x * l * 1.414; out[i:i + len(x), 1] += x * r * 1.414

def flick():  # a page lifting: a short rising rustle of paper
    n = int(0.26 * SR); t = np.arange(n) / SR
    x = bp(noise(n), 1800, 7500) * np.sin(np.pi * np.minimum(1, t / 0.26)) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t) ** 2)
    return x
def shutter():  # two tiny clicks, a camera's leaf
    n = int(0.09 * SR); x = np.zeros(n)
    for at, g in ((0, 1.0), (0.045, 0.7)):
        m = int(0.03 * SR); i = int(at * SR)
        x[i:i + m] += bp(noise(m), 2500, 9000) * env(m, 0.0005, 0.004) * g
    return x
def pat():  # a palm on card
    n = int(0.18 * SR); t = np.arange(n) / SR
    return bp(noise(n), 300, 2500) * env(n, 0.001, 0.02) + 0.8 * np.sin(2 * np.pi * 110 * t) * env(n, 0.002, 0.04)
def knock(f0):  # a die on a table
    n = int(0.08 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f0 * t) * env(n, 0.0005, 0.012) + 0.4 * bp(noise(n), 2000, 6000) * env(n, 0.0005, 0.005)
def slap():
    n = int(0.16 * SR)
    return bp(noise(n), 900, 5000) * env(n, 0.0008, 0.018)
def pop():  # a soft cork-like pop with a little air after it
    n = int(0.3 * SR); t = np.arange(n) / SR
    f = 520 * np.exp(-t / 0.03) + 150
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.05) + 0.25 * bp(noise(n), 3000, 9000) * env(n, 0.01, 0.07)
def pluck():
    n = int(0.35 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 740 * t) + 0.4 * np.sin(2 * np.pi * 1480 * t)) * env(n, 0.001, 0.07)

for s in SCENES + [WAITER, LAST, END]:
    put(flick(), s - 1, -20, rng.uniform(-0.2, 0.2))
for s in SCENES[:1] + SCENES[2:]:  # the quiz page has no photo of its own (it runs on into the dice page)
    put(shutter(), s + 60, -24)
put(pat(), SCENES[0] + GAG + 26, -15, 0.25)                       # the tree sticker on the chart
for k, (df, f0) in enumerate(((12, 1500), (14, 1750), (20, 1650), (22, 1900))):
    put(knock(f0), SCENES[2] + GAG + 18 + df, -18 - 2 * (k // 2), 0.2)  # two dice, a bounce each
put(slap(), SCENES[5] + GAG + 24, -15)                             # the waiter's slap
put(pop(), 690, -13)
put(pat(), LAST + 8 + 30, -18, 0.2)                                 # he lands in the car seat                                                # "Party time!"

# a small warm room
d = np.zeros_like(out)
for ms, g in ((23, 0.18), (41, 0.12), (67, 0.07)):
    k = int(ms / 1000 * SR); d[k:] += out[:-k][:, ::-1] * g
out = out + d
print("peak dBFS", round(20 * np.log10(np.abs(out).max()), 1))
pcm = (np.clip(out, -1, 1) * 32767).astype("<i2").tobytes()
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", "-t", str(TOTAL / FPS),
                "-b:a", "192k", "public/campaigns/xmas-party-2026/party-sfx.mp3"], input=pcm, check=True)
