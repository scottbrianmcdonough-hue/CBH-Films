#!/usr/bin/env python3
"""Synthesise the magnet reel's sounds (public/campaigns/magnet/*.wav, 48k stereo).

No whoosh (Scott), no hum. Iron filings are tiny and hard: everything here is ticks, a
few milliseconds of bright filtered noise each, in clouds.

  sprinkle.wav  the filings scattered on the black: 2.4s of light, dry patter.
  creep.wav     the pull: 3.4s (beat 9 to the drop's kick) of ticks thickening as the
                filings gather speed, the same exponential as their motion.
  snap.wav      the drop: the filings striking the CB, a dense rush of clicks over
                0.8s, heaviest at the front, with a firmer knock under the first.
  lock.wav      the filings locking into one piece: 1.6s of harder, lower clicks
                passing through like a wave, thickest in the middle.

Usage: python3 scripts/magnet-sfx.py [out_dir]
"""

import sys
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(31)


def bandpass(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def tick(lo=3000, hi=6500, dur=(0.002, 0.006)):
    n = int(rng.uniform(*dur) * SR)
    x = rng.normal(size=n) * np.exp(-np.linspace(0, 8, n))
    f = rng.uniform(lo, hi)
    return bandpass(x, f, min(f * 2.6, 20000))


def cloud(length, rate, gain, lo=3000, hi=6500):
    """Ticks at `rate(t)` per second, each scaled by `gain(t)`, panned at random."""
    out = np.zeros((int(length * SR), 2))
    s = 0.0
    while True:
        s += rng.exponential(1 / max(rate(s), 5))
        if s >= length - 0.02:
            return out
        c = tick(lo, hi) * rng.uniform(0.3, 1.0) * gain(s)
        p = rng.uniform(0.1, 0.9)
        i = int(s * SR)
        j = min(len(out), i + len(c))
        out[i:j, 0] += c[: j - i] * (1 - p)
        out[i:j, 1] += c[: j - i] * p


def write(path, x, peak=0.5):
    x = x / (np.abs(x).max() or 1) * peak
    wavfile.write(path, SR, (x * 32767).astype(np.int16))


out = Path(sys.argv[1] if len(sys.argv) > 1 else "public/campaigns/magnet")
out.mkdir(parents=True, exist_ok=True)

sprinkle = cloud(
    2.4,
    lambda s: 260 * np.exp(-(((s - 0.9) / 0.6) ** 2)),
    lambda s: 0.6,
    2000,
    5000,
)
write(out / "sprinkle.wav", sprinkle, peak=0.3)

CREEP = 3.4
creep = cloud(
    CREEP,
    lambda s: 8 + 900 * (np.exp(6 * s / CREEP) - 1) / (np.exp(6) - 1),
    lambda s: 0.25 + 0.75 * s / CREEP,
)
write(out / "creep.wav", creep, peak=0.35)

snap = cloud(0.9, lambda s: 2600 * np.exp(-s / 0.2), lambda s: np.exp(-s / 0.35))
n = int(0.08 * SR)
knock = bandpass(rng.normal(size=n) * np.exp(-np.linspace(0, 9, n)), 400, 1800, order=3)
snap[:n, 0] += knock * 3
snap[:n, 1] += knock * 3
write(out / "snap.wav", snap, peak=0.5)
lock = cloud(
    1.6, lambda s: 20 + 420 * np.exp(-(((s - 0.65) / 0.35) ** 2)), lambda s: 1.0, 1500, 3800
)
write(out / "lock.wav", lock, peak=0.4)
print("wrote", out / "sprinkle.wav", out / "creep.wav", out / "snap.wav", out / "lock.wav")
