#!/usr/bin/env python3
"""Soundtrack for the GN Revenue Management animation (Scott, 27 Nov: "need a non silent version").

  - the track: Inspiring Uplifting Indie Rock (Music_for_Creators, Pixabay 328509, 120 BPM), the same song as the
    Contact Centre post so GN's posts share a sound, but its ending: the last hit (130.09s) lands on END, where the
    roundel comes to the middle of the end card, and the song rings out under it.
  - the taps: a soft click as each point of the service lands (FEATURES), kept low under the music. No whooshes or chimes.
Timings are read from src/linkedin/GNRevenue.tsx (BEAT, END and T). Writes public/campaigns/gn-revenue/soundtrack.wav.
Usage: python3 scripts/gn-revenue-sfx.py
"""
import os
import re
import subprocess
import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
FPS = 30
rng = np.random.default_rng(12)

src = open("src/linkedin/GNRevenue.tsx").read()
BEAT = int(re.search(r"export const BEAT = (\d+)", src).group(1))
END = int(re.search(r"export const END = (\d+)", src).group(1))
FRAMES = END + int(re.search(r"GN_REVENUE_FRAMES = T\.END \+ (\d+)", src).group(1))


def beat(n):
    return END - n * BEAT


def val(name):
    m = re.search(rf"  {name}: beat\((\d+)\)( [+-] \d+)?", src)
    return beat(int(m.group(1))) + (int(m.group(2).replace(" ", "")) if m.group(2) else 0)


feats = re.search(r"FEATURES: \[([^\]]*)\]", src).group(1)
FEATURES = [beat(int(n)) for n in re.findall(r"beat\((\d+)\)", feats)]

N = int(FRAMES / FPS * SR)
tt = np.arange(N) / SR

# the track, its last hit on END
TRACK = "public/music/musicforcreators-inspiring-uplifting-indie-rock-328509.mp3"
HIT = 130.09
start = HIT - END / FPS
raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{start:.4f}", "-t", f"{FRAMES / FPS:.4f}", "-i", TRACK,
                      "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
music = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
music *= np.clip(tt / 0.4, 0, 1)[:, None]


def room(x, decay=0.25, wet=0.2):
    n = int(SR * decay * 2)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * decay / 6.9))
    ir = sosfilt(butter(2, [300, 6000], "band", fs=SR, output="sos"), ir)
    ir /= np.sqrt(np.sum(ir**2))
    return x + wet * np.convolve(x, ir)[: len(x)]


fx = np.zeros(N)

# a tick: a short click with a little woody body
def tick(pitch, gain):
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    click = sosfilt(butter(2, [pitch, pitch * 3], "band", fs=SR, output="sos"), rng.standard_normal(n)) * np.exp(-t / 0.0025)
    body = np.sin(2 * np.pi * pitch * 0.5 * t) * np.exp(-t / 0.008)
    x = click + body * 0.4
    return gain * x / np.max(np.abs(x))


for k, at in enumerate(FEATURES):  # a soft tap as each point of the service lands, its tick drawing
    c = tick(1300 + k * 90, 0.1)
    i = int((at + 5) / FPS * SR)
    fx[i:i + len(c)] += c

fx = room(fx)
mix = music.copy()
mix[:, 0] += fx
mix[:, 1] += fx * 0.9


def write(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def lufs(path):
    err = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", err)[-1])


os.makedirs("public/campaigns/gn-revenue", exist_ok=True)
OUT = "public/campaigns/gn-revenue/soundtrack.wav"
write(OUT, mix * 0.5)
gain = 0.5 * 10 ** ((-16 - lufs(OUT)) / 20)
peak = np.max(np.abs(mix)) * gain
if peak > 10 ** (-1.5 / 20):
    gain *= 10 ** (-1.5 / 20) / peak
write(OUT, mix * gain)
print(f"features {FEATURES}, end {END}, frames {FRAMES}, track from {start:.2f}s; "
      f"{lufs(OUT):.1f} LUFS, peak {20 * np.log10(np.max(np.abs(mix * gain))):.1f} dBFS")
