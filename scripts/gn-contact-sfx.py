#!/usr/bin/env python3
"""Soundtracks for the GN Customer Contact Centre animation, one per track (Scott, 27 Nov: "add sound effects and
maybe a track"; then "sound is too loud on the ring and don't like the music").

  - the track: its big hit lands on the pickup (GN_CONTACT_TRACKS in src/linkedin/gn-contact-timing.ts). Until then it
    is held 6 dB down and a little dull (a low pass at 1.8 kHz), so the phone sits over it; on the hit it opens out to
    full band under the answer and the end card, then fades over the last second.
  - the phone: a desk phone's electronic trill on every ring burst (the same frames as the icons' wobble), two tones
    alternating fast, a little grit, in a small room, kept low; the last burst is cut by the pickup.
  - the pickup: the handset lifted off its cradle, a plastic clack and the hook switch just after.
No whooshes or chimes. Timings come from gn-contact-timing.ts through node, so they always match the picture.
Writes public/campaigns/gn-contact/soundtrack-<track>.wav (48 kHz stereo, about -16 LUFS).
Usage: python3 scripts/gn-contact-sfx.py
"""
import json
import re
import subprocess
import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
FPS = 30
RING_PEAK = 0.12  # the phone, before the overall gain (was 0.32: "too loud on the ring")
CLACK_PEAK = 0.3

# timings and tracks from the picture's own file
js = """
import('./src/linkedin/gn-contact-timing.ts').then((m) => {
  const out = {};
  for (const t of Object.keys(m.GN_CONTACT_TRACKS)) out[t] = { ...m.GN_CONTACT_TRACKS[t], ...m.gnContactTiming(t) };
  console.log(JSON.stringify({ tracks: out, ringOn: m.RING_ON }));
});
"""
data = json.loads(subprocess.run(["node", "--no-warnings", "--experimental-strip-types", "-e", js],
                                 capture_output=True, text=True, check=True).stdout)
RING_ON = data["ringOn"]


# a small room: a short burst of decaying noise as the impulse response
def room(x, rng, decay=0.3, wet=0.22):
    n = int(SR * decay * 2)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * decay / 6.9))
    ir = sosfilt(butter(2, [300, 6000], "band", fs=SR, output="sos"), ir)
    ir /= np.sqrt(np.sum(ir**2))
    return x + wet * np.convolve(x, ir)[: len(x)]


# the phone: two tones alternating at 20 Hz, a little grit, shaped by a plastic body
def trill(length):
    t = np.arange(int(length * SR)) / SR
    sw = 0.5 + 0.5 * np.tanh(6 * np.sin(2 * np.pi * 20 * t))  # a softened square: which tone sounds
    x = sw * np.sin(2 * np.pi * 1120 * t) + (1 - sw) * np.sin(2 * np.pi * 1400 * t)
    x = np.tanh(1.8 * x)  # odd harmonics, the buzz of a small speaker
    return sosfilt(butter(2, [700, 4200], "band", fs=SR, output="sos"), x)


# the handset lifting: a plastic clack with a little body
def clack(rng, gain, bright):
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    noise = sosfilt(butter(2, [bright * 0.4, bright], "band", fs=SR, output="sos"), rng.standard_normal(n))
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.012)
    return gain * (noise * np.exp(-t / 0.004) * 0.9 + body * 0.5)


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


for name, T in data["tracks"].items():
    rng = np.random.default_rng(27)
    frames, pickup = T["FRAMES"], T["PICKUP"]
    N = int(frames / FPS * SR)
    tt = np.arange(N) / SR
    t_pick = pickup / FPS

    # the track, its hit on the pickup
    start = T["hit"] - t_pick
    pad = max(0.0, -start)
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", f"{max(0.0, start):.4f}", "-t", f"{frames / FPS:.4f}", "-i",
         f"public/{T['file']}", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
        capture_output=True, check=True).stdout
    music = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
    music = np.pad(music, ((int(pad * SR), 0), (0, 0)))
    music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
    held = sosfilt(butter(2, 1800, "low", fs=SR, output="sos"), music, axis=0) * 10 ** (-6 / 20)
    open_ = np.clip((tt - t_pick) / 0.08, 0, 1)[:, None]
    mix = held * (1 - open_) + music * open_
    mix *= np.clip(tt / 0.5, 0, 1)[:, None]
    mix *= np.clip((frames / FPS - tt) / 1.0, 0, 1)[:, None]

    # the phone
    phone = np.zeros(N)
    for r in T["RINGS"]:
        for a, b in RING_ON:
            s, e = r + a, min(r + b, pickup)
            if e <= s:
                continue
            seg = trill((e - s) / FPS)
            n = len(seg)
            env = np.ones(n)
            att = int(0.008 * SR)
            rel = int(0.004 * SR) if r + b > pickup else int(0.025 * SR)  # cut by the pickup: stops dead
            env[:att] = np.linspace(0, 1, att)
            env[-rel:] *= np.linspace(1, 0, rel)
            i = int(s / FPS * SR)
            phone[i:i + n] += (seg * env)[: N - i]
    phone = room(phone, rng)
    phone *= RING_PEAK / np.max(np.abs(phone))

    # the pickup, and the hook switch 45 ms later
    pick = np.zeros(N)
    for dt, g, b in [(0.0, 1.0, 5000), (0.045, 0.45, 3500)]:
        c = clack(rng, g, b)
        i = int((t_pick + dt) * SR)
        pick[i:i + len(c)] += c[: N - i]
    pick = room(pick, rng, 0.25, 0.3)
    pick *= CLACK_PEAK / np.max(np.abs(pick))

    # the phone a touch left of centre (a desk across the lobby), the clack close and central
    mix[:, 0] += phone + pick
    mix[:, 1] += phone * 0.8 + pick

    # about -16 LUFS, peaks under -1.5 dBFS
    out = f"public/campaigns/gn-contact/soundtrack-{name}.wav"
    write(out, mix * 0.5)
    gain = 0.5 * 10 ** ((-16 - lufs(out)) / 20)
    peak = np.max(np.abs(mix)) * gain
    if peak > 10 ** (-1.5 / 20):
        gain *= 10 ** (-1.5 / 20) / peak
    write(out, mix * gain)
    print(f"{name}: {frames} frames, pickup {pickup}, rings {T['RINGS']}, track from {start:.2f}s; "
          f"{lufs(out):.1f} LUFS, peak {20 * np.log10(np.max(np.abs(mix * gain))):.1f} dBFS")
