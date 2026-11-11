#!/usr/bin/env python3
"""Sound for the CB Global Hub animation (src/linkedin/GlobalHub.tsx): the piano (the soft cinematic piano from
public/campaigns/bonfire/cinematic-piano.mp3) with two subtle touches synthesised under it (Scott, 11 Nov: "a mellow
track and subtle sound effects"): a quiet latch as the door opens and a soft bell as each of the eight markets lights,
rising through F major pentatonic (the piano sits on C and F), plus a faint shimmer as the agents' dust spreads. Frame
times match GlobalHub.tsx. Writes public/campaigns/global-hub/sound.wav (14s, stereo, the piano mixed in).
Usage: scripts/global-hub-sfx.py"""
import numpy as np, subprocess, soundfile as sf, os

SR = 48000
FPS = 30
DUR = 14.0
OPEN = 12
LANDS = [112 + 16 * i + 28 for i in range(8)]
STAT2 = 276
n = int(DUR * SR)
rng = np.random.default_rng(3)

def env(t, a, d):
    return np.minimum(t / a, 1) * np.exp(-t / d)

def bell(freq, dur=1.8, amp=0.1):
    t = np.arange(int(dur * SR)) / SR
    s = sum(w * np.sin(2 * np.pi * freq * r * t) for r, w in [(1, 1), (2.0, 0.28), (3.01, 0.12), (4.2, 0.05)])
    return amp * s * env(t, 0.004, 0.55)

def latch():
    t = np.arange(int(0.25 * SR)) / SR
    click = rng.standard_normal(len(t)) * env(t, 0.0005, 0.006)
    click = np.convolve(click, np.ones(6) / 6, "same")
    thump = np.sin(2 * np.pi * 95 * t) * env(t, 0.002, 0.05)
    return 0.12 * click + 0.08 * thump

def shimmer(dur=2.4):
    t = np.arange(int(dur * SR)) / SR
    s = np.zeros_like(t)
    for k in range(40):
        f = rng.uniform(2600, 6200)
        t0 = rng.uniform(0, dur - 0.4)
        m = t >= t0
        s[m] += np.sin(2 * np.pi * f * (t[m] - t0)) * env(t[m] - t0, 0.003, 0.12)
    return 0.012 * s * np.sin(np.pi * t / dur)

fx = np.zeros((n, 2))
def put(sig, frame, pan=0.0):
    i = int(frame / FPS * SR)
    sig = sig[: max(0, n - i)]
    fx[i : i + len(sig), 0] += sig * (1 - pan) ** 0.5 / 2 ** -0.5 * 0.7071
    fx[i : i + len(sig), 1] += sig * (1 + pan) ** 0.5 / 2 ** -0.5 * 0.7071

put(latch(), OPEN + 2)
notes = [392.0, 440.0, 523.25, 587.33, 698.46, 783.99, 880.0, 1046.5]  # G A C D F G A C
pans = [-0.5, 0.3, -0.6, 0.6, -0.2, 0.5, -0.4, 0.2]
for f, fr, p in zip(notes, LANDS, pans):
    put(bell(f), fr, p)
put(shimmer(), STAT2 + 4)

# the piano, from its start, faded over the last second
tmp = "/dev/shm/global-hub-piano.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "public/campaigns/bonfire/cinematic-piano.mp3", "-t", str(DUR),
                "-ar", str(SR), "-ac", "2", tmp], check=True)
piano, _ = sf.read(tmp)
piano = np.pad(piano, ((0, max(0, n - len(piano))), (0, 0)))[:n]
fade = np.ones(n); f0 = int((DUR - 1.2) * SR); fade[f0:] = np.linspace(1, 0, n - f0)
fade[: int(0.15 * SR)] = np.linspace(0, 1, int(0.15 * SR))
mix = piano * 0.8 * fade[:, None] + fx
mix /= max(1.0, np.abs(mix).max() / 0.89)
os.makedirs("public/campaigns/global-hub", exist_ok=True)
sf.write("public/campaigns/global-hub/sound.wav", mix, SR, subtype="PCM_16")
print("peak", np.abs(mix).max())
