#!/usr/bin/env python3
"""Sound for the GN key fob (Scott: "should you add a sound effect"; the stat videos were
silent because they were quick infographics, this is a brand moment).

All synthesised, all small and close, like a real key in a quiet room:
  - the open: the key settling against its ring, three soft clinks
  - the turn: a light metal tick each time the fob's loop rolls over on the ring (every
    half turn), so the ticks speed up and slow down with the spin
  - the landing: the fob stops face on with one clink and a little bounce
  - the lockup: one last faint touch of the ring as the key goes into the dark
Metal is a few inharmonic partials up high (2-9 kHz) with short decays over a click of
noise: no low sine tones (Scott found a sine "boing" on the deck reel). A small room
under it. The timings are read from src/linkedin/GNKeyFob.tsx (GAPS, START) so they stay
on the picture. Writes public/campaigns/gn-key/sfx.wav.
Usage: python3 scripts/gn-key-sfx.py
"""
import re
import wave

import numpy as np

SR = 48000
FPS = 30
rng = np.random.default_rng(11)

src = open("src/linkedin/GNKeyFob.tsx").read()
GAPS = [float(v) for v in re.search(r"const GAPS = \[([^\]]*)\]", src).group(1).replace("\n", " ").split(",") if v.strip()]
START = float(re.search(r"const START = (\d+)", src).group(1))
FACE_AT = np.concatenate([[START], START + np.cumsum(GAPS)])
LANDED = FACE_AT[-1]
TOTAL = LANDED + 120


def slopes():
    d = 1 / np.diff(FACE_AT)
    m = np.zeros(len(FACE_AT))
    m[1:-1] = 2 * d[:-1] * d[1:] / (d[:-1] + d[1:])
    return m


M = slopes()


def half_turns(f):
    # the same monotone cubic as the picture
    if f <= FACE_AT[0]:
        return 0.0
    if f >= LANDED:
        return float(len(FACE_AT) - 1)
    i = int(np.searchsorted(FACE_AT, f) - 1)
    h = FACE_AT[i + 1] - FACE_AT[i]
    t = (f - FACE_AT[i]) / h
    return (
        (2 * t**3 - 3 * t**2 + 1) * i
        + (t**3 - 2 * t**2 + t) * h * M[i]
        + (-2 * t**3 + 3 * t**2) * (i + 1)
        + (t**3 - t**2) * h * M[i + 1]
    )


def bandpass(x, lo, hi):
    f = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(len(x), 1 / SR)
    f[(freqs < lo) | (freqs > hi)] = 0
    return np.fft.irfft(f, len(x))


def clink(f0, gain, decay):
    """Brass on steel: a click, then a few inharmonic partials dying away."""
    n = int((decay * 6 + 0.01) * SR)
    t = np.arange(n) / SR
    out = bandpass(rng.standard_normal(n), 3000, 11000) * np.exp(-t / 0.0012) * 0.6
    for ratio, amp, dk in [(1, 1, 1), (1.53, 0.55, 0.7), (2.31, 0.35, 0.5), (3.17, 0.2, 0.35)]:
        f = f0 * ratio * (1 + 0.004 * rng.standard_normal())
        if f > 15000:
            continue
        out += amp * np.sin(2 * np.pi * f * t + rng.random() * 6.28) * np.exp(-t / (decay * dk))
    # a soft attack so it doesn't spit
    out[: int(0.0006 * SR)] *= np.linspace(0, 1, int(0.0006 * SR))
    return out * gain


def tick(gain):
    """The fob's loop rolling over on the ring: a tiny dry metal tick."""
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    out = bandpass(rng.standard_normal(n), 2500, 9000) * np.exp(-t / 0.0015)
    f = 5200 + 900 * rng.standard_normal()
    out += 0.35 * np.sin(2 * np.pi * f * t) * np.exp(-t / 0.012)
    return out * gain


def room(x):
    """A small, quiet room: a short decaying noise tail, low in the mix."""
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t / 0.07)
    ir = bandpass(ir, 400, 8000)
    ir[: int(0.006 * SR)] = 0  # pre-delay
    wet = np.fft.irfft(np.fft.rfft(x, len(x) + n) * np.fft.rfft(ir, len(x) + n))[: len(x)]
    return x + 0.12 * wet / np.max(np.abs(wet)) * np.max(np.abs(x))


out = np.zeros(int(TOTAL / FPS * SR) + SR // 2)


def place(sec, s):
    k = int(sec * SR)
    out[k : k + len(s)] += s[: max(0, len(out) - k)]


# the open: the key settling against its ring
for at, f0, g, dk in [(0.03, 3100, 0.8, 0.05), (0.2, 3600, 0.5, 0.04), (0.42, 2800, 0.3, 0.035)]:
    place(at, clink(f0, g, dk))

# the turn: a tick at every edge-on, softer as the spin runs fast so it whirrs, not rattles
frames = np.arange(0, LANDED + 1, 0.05)
ht = np.array([half_turns(f) for f in frames])
for k in range(len(FACE_AT) - 1):
    f = frames[np.searchsorted(ht, k + 0.5)]
    speed = half_turns(f + 0.5) - half_turns(f - 0.5)
    g = np.interp(speed, [0.05, 0.25], [0.42, 0.24]) * (0.85 + 0.3 * rng.random())
    place(f / FPS, tick(g))

# the landing: one clink as it stops face on, a small bounce after
place(LANDED / FPS - 0.02, clink(2900, 0.9, 0.07))
place(LANDED / FPS + 0.13, clink(3400, 0.28, 0.04))

# the lockup: the ring touched once more as the key goes into the dark
place((LANDED + 16) / FPS, clink(4100, 0.16, 0.06))

out = room(out)
out = out / np.max(np.abs(out)) * 10 ** (-3 / 20)
data = (np.clip(out, -1, 1) * 32767).astype(np.int16)
with wave.open("public/campaigns/gn-key/sfx.wav", "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(data.tobytes())
print(f"{len(FACE_AT) - 1} ticks, landed at {LANDED / FPS:.2f}s, {len(out) / SR:.2f}s")
