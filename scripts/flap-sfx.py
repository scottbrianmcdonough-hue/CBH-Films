#!/usr/bin/env python3
"""Soft split-flap sounds for the Departures reel (Scott: "add a soft flap sound").

Each flap is a short, muted tick: a 2-3 ms burst of noise band-passed round 2-5 kHz
(the plastic leaf), a little low body (the drum it hangs on), a fast decay. No sine
tones (Scott found a sine "boing" on the deck reel's cards). Writes:
  flap-riffle.wav  one row settling: ~0.5s of ticks, quick then slowing to a stop
  flap-turn.wav    the whole frame turning over: ~1.0s, denser, a little fuller
Usage: python3 scripts/flap-sfx.py public/campaigns/departures
"""
import sys
import wave

import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def bandpass(x, lo, hi):
    f = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(len(x), 1 / SR)
    f[(freqs < lo) | (freqs > hi)] = 0
    return np.fft.irfft(f, len(x))


def tick(gain):
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    leaf = bandpass(noise, 2000, 5200) * np.exp(-t / 0.0025)
    body = bandpass(noise, 180, 700) * np.exp(-t / 0.006) * 0.5
    return (leaf + body) * gain


def riffle(length, count, spread, gain):
    out = np.zeros(int(length * SR))
    # ticks bunched at the start and thinning out as the flaps settle
    times = np.sort(rng.random(count) ** spread) * (length - 0.04)
    for i, at in enumerate(times):
        g = gain * (0.55 + 0.45 * rng.random()) * (1 - 0.6 * i / count)
        s = tick(g)
        k = int(at * SR)
        out[k : k + len(s)] += s[: len(out) - k]
    fade = np.ones(len(out))
    fade[-int(0.05 * SR) :] = np.linspace(1, 0, int(0.05 * SR))
    return out * fade


def write(path, x, peak_db):
    x = x / np.max(np.abs(x)) * 10 ** (peak_db / 20)
    data = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


if __name__ == "__main__":
    d = sys.argv[1]
    write(f"{d}/flap-riffle.wav", riffle(0.55, 34, 1.8, 1.0), -6)
    write(f"{d}/flap-turn.wav", riffle(1.05, 110, 1.3, 1.0), -4)
    print("wrote", f"{d}/flap-riffle.wav", f"{d}/flap-turn.wav")
