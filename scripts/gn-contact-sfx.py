#!/usr/bin/env python3
"""Soundtrack for the GN Customer Contact Centre animation (Scott, 27 Nov: "add sound effects and maybe a track").

  - the track: Christmas Event Upbeat by bombinsound (Pixabay 638761, 160 BPM), the stretch that runs into its own
    ending, its last beat (120.41s) on LAST_BEAT. Until the pickup it is heard muffled, as if from the next room
    (a low pass at 650 Hz, 5 dB down): the busy lobby. On the pickup it opens out to full band for the end card.
  - the phone: a desk phone's electronic trill on every ring burst (RINGS and RING_ON, the same as the picture's
    wobble), two tones alternating fast, a little grit, in a small room; the last burst is cut by the pickup.
  - the pickup: the handset lifted off its cradle at PICKUP, a plastic clack and the hook switch just after.
No whooshes or chimes. Timings are read from src/linkedin/GNContactCentre.tsx so they stay on the picture.
Writes public/campaigns/gn-contact/soundtrack.wav (48 kHz stereo).
Usage: python3 scripts/gn-contact-sfx.py
"""
import re
import subprocess
import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
FPS = 30
rng = np.random.default_rng(27)

# timings from the picture
src = open("src/linkedin/GNContactCentre.tsx").read()
FRAMES = int(re.search(r"GN_CONTACT_FRAMES = (\d+)", src).group(1))
LAST_BEAT = float(re.search(r"const LAST_BEAT = (\d+)", src).group(1))
BEAT = float(re.search(r"const BEAT = ([\d.]+)", src).group(1))


def beat(n):
    return round(LAST_BEAT - n * BEAT)


consts = {}
for name, n in re.findall(r"const (L1|L2|L3) = beat\((\d+)\)", src):
    consts[name] = beat(int(n))
cards = [beat(int(n)) for n in re.findall(r"beat\((\d+)\)", re.search(r"const CARDS = \[([^\]]*)\]", src).group(1))]
PICKUP = beat(int(re.search(r"PICKUP = beat\((\d+)\)", src).group(1)))
rings_src = re.search(r"export const RINGS = \[(.*?)\];", src).group(1)
RINGS = []
for item in rings_src.split(","):
    item = item.strip()
    if item == "L2 + 11":
        RINGS.append(consts["L2"] + 11)
    elif re.fullmatch(r"CARDS\[(\d)\]", item):
        RINGS.append(cards[int(item[6])])
    else:
        RINGS.append(int(item))
RING_ON = [tuple(int(v) for v in pair) for pair in re.findall(r"\[(\d+), (\d+)\]", src.split("RING_ON")[1].split(";")[0])]

N = int(FRAMES / FPS * SR)
t_of = lambda frame: frame / FPS  # noqa: E731

# the track
TRACK = "public/music/festive/bombinsound-christmas-event-upbeat-638761.mp3"
TRACK_LAST_BEAT = 120.41
start = TRACK_LAST_BEAT - LAST_BEAT / FPS
raw = subprocess.run(
    ["ffmpeg", "-v", "error", "-ss", f"{start:.4f}", "-t", f"{FRAMES / FPS:.4f}", "-i", TRACK,
     "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
    capture_output=True, check=True).stdout
music = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]

muffled = sosfilt(butter(2, 650, "low", fs=SR, output="sos"), music, axis=0) * 10 ** (-5 / 20)
tt = np.arange(N) / SR
open_ = np.clip((tt - t_of(PICKUP)) / 0.12, 0, 1)[:, None]
music_mix = muffled * (1 - open_) + music * open_
music_mix *= np.clip(tt / 0.6, 0, 1)[:, None]  # fade in from silence
music_mix *= np.clip((FRAMES / FPS - tt) / 0.4, 0, 1)[:, None]  # last breath out


# a small room: a short burst of decaying noise as the impulse response
def room(x, decay=0.3, wet=0.22):
    n = int(SR * decay * 2)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * decay / 6.9))
    ir = sosfilt(butter(2, [300, 6000], "band", fs=SR, output="sos"), ir)
    ir /= np.sqrt(np.sum(ir**2))
    w = np.convolve(x, ir)[: len(x)]
    return x + wet * w


# the phone: two tones alternating at 20 Hz, a little grit, shaped by a plastic body
def trill(length):
    t = np.arange(int(length * SR)) / SR
    sw = 0.5 + 0.5 * np.tanh(6 * np.sin(2 * np.pi * 20 * t))  # a softened square: which tone sounds
    ph1 = 2 * np.pi * 1120 * t
    ph2 = 2 * np.pi * 1400 * t
    x = sw * np.sin(ph1) + (1 - sw) * np.sin(ph2)
    x = np.tanh(1.8 * x)  # odd harmonics, the buzz of a small speaker
    x = sosfilt(butter(2, [700, 4200], "band", fs=SR, output="sos"), x)
    return x


phone = np.zeros(N)
for r in RINGS:
    for a, b in RING_ON:
        s, e = r + a, min(r + b, PICKUP)
        if e <= s:
            continue
        seg = trill((e - s) / FPS)
        n = len(seg)
        env = np.ones(n)
        att, rel = int(0.008 * SR), int(0.025 * SR)
        env[:att] = np.linspace(0, 1, att)
        cut = r + b > PICKUP  # cut by the pickup: stops dead
        rel = int(0.004 * SR) if cut else rel
        env[-rel:] *= np.linspace(1, 0, rel)
        i = int(t_of(s) * SR)
        phone[i:i + n] += seg[: N - i] * env[: N - i]
phone = room(phone)
phone *= 0.32 / np.max(np.abs(phone))


# the pickup: the handset lifting (a plastic clack with a little body) and the hook switch 45 ms later
def clack(gain, bright):
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    noise = sosfilt(butter(2, [bright * 0.4, bright], "band", fs=SR, output="sos"), rng.standard_normal(n))
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.012)
    return gain * (noise * np.exp(-t / 0.004) * 0.9 + body * 0.5)


pick = np.zeros(N)
for dt, g, b in [(0.0, 1.0, 5000), (0.045, 0.45, 3500)]:
    c = clack(g, b)
    i = int((t_of(PICKUP) + dt) * SR)
    pick[i:i + len(c)] += c[: N - i]
pick = room(pick, 0.25, 0.3)
pick *= 0.45 / np.max(np.abs(pick))

# mix: the phone a touch left of centre (a desk across the lobby), the clack close and central
mix = music_mix.copy()
mix[:, 0] += phone * 1.0 + pick
mix[:, 1] += phone * 0.8 + pick

# loudness: measure with ffmpeg, set to about -16 LUFS, keep peaks under -1.5 dBFS
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


OUT = "public/campaigns/gn-contact/soundtrack.wav"
write(OUT, mix * 0.5)
gain = 0.5 * 10 ** ((-16 - lufs(OUT)) / 20)
peak = np.max(np.abs(mix)) * gain
if peak > 10 ** (-1.5 / 20):
    gain *= 10 ** (-1.5 / 20) / peak
write(OUT, mix * gain)
print(f"rings {RINGS}, pickup {PICKUP}, track from {start:.2f}s; {lufs(OUT):.1f} LUFS, "
      f"peak {20 * np.log10(np.max(np.abs(mix * gain))):.1f} dBFS")
