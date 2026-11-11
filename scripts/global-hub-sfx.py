#!/usr/bin/env python3
"""Sound for the CB Global Hub animation (src/linkedin/GlobalHub.tsx): the piano (the soft cinematic piano from
public/campaigns/bonfire/cinematic-piano.mp3) with two subtle touches synthesised under it (Scott, 11 Nov: "a mellow
track and subtle sound effects"): a quiet latch as the door opens and a soft bell as each of the eight markets lights,
rising through F major pentatonic (the piano sits on C and F), plus a faint shimmer as the agents' dust spreads. Frame
times match GlobalHub.tsx. Writes public/campaigns/global-hub/sound.wav (14s, stereo, the piano mixed in).
Usage: scripts/global-hub-sfx.py"""
import numpy as np, subprocess, soundfile as sf, os, sys

# --diagram: the CBHUB diagram cut (src/linkedin/CBHubDiagram.tsx): a soft click as the hub lights, the eight bells on
# the partnership count's ticks, 18s; writes sound-diagram.wav
DIAGRAM = "--diagram" in sys.argv
# --story: the diagram then the map (src/linkedin/CBHubStory.tsx): the click as the hub lights, the bells as the eight
# markets land in the map act (it starts at frame 180), 25s; writes sound-story.wav
STORY = "--story" in sys.argv
# the story tried Fine Taste, then Scott went back to the piano (11 Nov): keep this off
FINE_TASTE = False

SR = 48000
FPS = 30
DUR = 25.6 if STORY else 18.0 if DIAGRAM else 19.0
OPEN = 12
LANDS = [240 + 112 + 12 * i + 28 for i in range(8)] if STORY else [206 + 10 + i * 9 for i in range(8)] if DIAGRAM else [112 + 16 * i + 28 for i in range(8)]
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

put(latch(), 118 if (DIAGRAM or STORY) else OPEN + 2)
notes = [392.0, 440.0, 523.25, 587.33, 698.46, 783.99, 880.0, 1046.5]  # G A C D F G A C (the piano's F major)
if STORY and FINE_TASTE:  # Fine Taste sits in G major: G major pentatonic
    notes = [392.0, 440.0, 493.88, 587.33, 659.25, 783.99, 880.0, 987.77]
pans = [-0.5, 0.3, -0.6, 0.6, -0.2, 0.5, -0.4, 0.2]
for f, fr, p in zip(notes, LANDS, pans):
    put(bell(f), fr, p)
# no shimmer under the count (Scott, 11 Nov: "don't like the count noise, sounds like sparkling")

# the piano, from its start, faded over the last second
tmp = "/dev/shm/global-hub-piano.wav"
# the story is on Fine Taste (miyagisama; Scott, 11 Nov: the piano "is like looping"): from 37.25s, its quiet breakdown
# under the diagram, the bass back (46.32s) as the camera comes through into the world (story 9.07s), its own ending
# under the logo
SRC = "public/campaigns/deck/music-fine-taste.mp3" if (STORY and FINE_TASTE) else "public/campaigns/bonfire/cinematic-piano.mp3"
SS = "37.25" if (STORY and FINE_TASTE) else "0"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", SS, "-i", SRC, "-t", str(DUR),
                "-ar", str(SR), "-ac", "2", tmp], check=True)
piano, _ = sf.read(tmp)
piano = np.pad(piano, ((0, max(0, n - len(piano))), (0, 0)))[:n]
fade = np.ones(n); f0 = int((DUR - 2.4) * SR); fade[f0:] = np.linspace(1, 0, n - f0) ** 1.5
fade[: int(0.15 * SR)] = np.linspace(0, 1, int(0.15 * SR))
# the story has no effects, the piano only (Scott, 11 Nov: "lose the sound effects")
if STORY:
    fx[:] = 0
mix = piano * (1.3 if (STORY and FINE_TASTE) else 0.8) * fade[:, None] + fx
mix /= max(1.0, np.abs(mix).max() / 0.89)
os.makedirs("public/campaigns/global-hub", exist_ok=True)
sf.write("public/campaigns/global-hub/" + ("sound-story.wav" if STORY else "sound-diagram.wav" if DIAGRAM else "sound.wav"), mix, SR, subtype="PCM_16")
print("peak", np.abs(mix).max())
