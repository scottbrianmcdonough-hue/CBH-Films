#!/usr/bin/env python3
"""Sound for the AMC reel's 25 (Scott: "can you add sound effects to the 25").

All synthesised and kept small, under the music:
  - the count: a soft shutter tick on every number, so the ticks run quick and slow with the
    counter as it eases into 25; each a click of filtered noise over a short metal partial,
    rising a little in pitch as the count climbs
  - nothing on 25 itself: the ting, the shimmer (Scott: "too much and fake, like whoosh and then
    ching") and then a latch's clunk (in the way of the song's own hit) were all dropped
A small room under it all. And the music under the 25 is filtered (Scott: "or use filtered
sound"): the end card's stretch of each track is written out with a low-pass that drops to a
muffle as the room goes dark, opens slowly as the count climbs and opens fully as 25 lands, so
the last hit comes in at full band (`outro-<track>.wav`). The timings come from src/hotel-film/amc/AmcReel.tsx (each track's
outro and hit, the count's start and its landing four frames before the hit), so the ticks
sit on the picture for every track. Writes public/campaigns/amc-2026/sfx/counter-<track>.wav,
starting on the end card's first frame.
Usage: python3 scripts/amc-25-sfx.py   (ONLY=<id>[,<id>] for some tracks)
"""
import math
import os
import re
import subprocess
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
FPS = 30
OUT = "public/campaigns/amc-2026/sfx"

src = open("src/hotel-film/amc/AmcReel.tsx").read()
COUNT_FROM = int(re.search(r"const COUNT_FROM = (\d+)", src).group(1))  # plus the cut's `late` (0 on Glorious)
LAND_BEFORE = int(re.search(r"const LAND = hit - (\d+);", src).group(1))
block = src[src.index("export const AMC_TRACKS") : src.index("satisfies Record<string, Track>")]
BOARD_AT = float(re.search(r"const BOARD_AT = ([\d.]+);", src).group(1))
ROWS_AT = float(re.search(r"const ROWS_AT = ([\d.]+);", src).group(1))
ROW_EVERY = float(re.search(r"const ROW_EVERY = ([\d.]+);", src).group(1))
TRACKS = {}
for m in re.finditer(r"(\w+): \{([^}]*)\}", block):
    vals = dict(re.findall(r"(outro|hit): ([\d.]+)", m.group(2)))
    srcm = re.search(r'src: "([^"]+)"', m.group(2))
    beat = float(re.search(r"beat: ([\d.]+)", m.group(2)).group(1))
    # the board's ticks: the first award and the spacing in seconds, if the track sets its own (`boardTicks`)
    bt = re.search(r"boardTicks: \[([\d.]+), ([\d.]+)\]", m.group(2))
    ticks_s = (float(bt.group(1)), float(bt.group(2))) if bt else ((ROWS_AT - BOARD_AT) * beat, ROW_EVERY * beat)
    TRACKS[m.group(1)] = (float(vals["outro"]), float(vals["hit"]), "public/" + srcm.group(1), ticks_s)


def count_at(k, land):
    if k < COUNT_FROM:
        return 1
    v = min(1, max(0, (k - COUNT_FROM) / (land - COUNT_FROM)))
    return min(25, 1 + math.floor(24 * (1 - (1 - v) ** 2.4) + 1e-6))


def bandpass(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lowpass(x, hi):
    return sosfilt(butter(4, hi, btype="low", fs=SR, output="sos"), x)


def highpass(x, lo):
    return sosfilt(butter(2, lo, btype="high", fs=SR, output="sos"), x)


def env(n, attack, decay):
    t = np.arange(n) / SR
    return np.minimum(1, t / attack) * np.exp(-t / decay)


def damped(n, f, decay, attack=0.0003):
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * env(n, attack, decay)


def tick(rng, step):
    """a fine watch's tic-tac (Scott: the counter sound "more premium"): two crisp clicks a few
    milliseconds apart over a faint brass ring, the hiss rolled off; step 0..1 lifts it a touch
    as the count climbs"""
    n = int(0.05 * SR)
    tic = highpass(rng.standard_normal(n), 3000) * env(n, 0.0002, 0.0018)
    tac = np.zeros(n)
    k = int(0.0026 * SR)
    tac[k:] = bandpass(rng.standard_normal(n - k), 1500, 4200) * env(n - k, 0.0002, 0.003) * 0.6
    f0 = 1650 + 300 * step
    ring = damped(n, f0, 0.018) * 0.22 + damped(n, f0 * 2.76, 0.008) * 0.08
    warm = lowpass(rng.standard_normal(n), 600) * env(n, 0.0005, 0.006) * 0.3
    return lowpass(tic + tac + ring + warm, 9000) * (0.7 + 0.2 * step)


def board_swell(rng):
    """the winners board coming up: a soft breath of air"""
    n = int(1.0 * SR)
    t = np.arange(n) / SR
    e = np.minimum(1, t / 0.25) * np.exp(-np.maximum(0, t - 0.25) / 0.25)
    return bandpass(rng.standard_normal(n), 400, 3500) * e * 0.06


def row_tick(rng):
    """an award landing on the board: a soft muted tick, lower and gentler than the counter's"""
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    tap = lowpass(rng.standard_normal(n), 1800) * env(n, 0.0008, 0.012)
    tone = np.sin(2 * np.pi * 880 * t) * env(n, 0.001, 0.02) * 0.4
    return (tap + tone) * 0.12


def room(x, rng):
    """a small, warm room, a little different in each ear so it has width"""
    out = []
    for c, seed in enumerate((1, 2)):
        r = np.random.default_rng(seed)
        n = int(0.35 * SR)
        ir = lowpass(r.standard_normal(n) * np.exp(-np.arange(n) / SR / 0.07), 4000)
        ch = x[:, c]
        wet = fftconvolve(ch, ir)[: len(ch)]
        out.append(ch + wet / np.max(np.abs(wet) + 1e-9) * np.max(np.abs(ch)) * 0.15)
    return np.stack(out, 1)


def write(path, x, peak_db=-6.0):
    x = x / max(1e-9, np.max(np.abs(x))) * 10 ** (peak_db / 20)  # the film sets its level
    st = x if x.ndim == 2 else np.stack([x, x], 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())


os.makedirs(OUT, exist_ok=True)
def cutoff(k, land):
    """the low-pass's cutoff in Hz at end card frame k"""
    if k < 12:  # down into the muffle as the room goes dark
        return 18000 * (500 / 18000) ** (k / 12)
    if k < land:  # opening slowly with the count
        u = (k - 12) / (land - 12)
        return 500 * (3200 / 500) ** (u**1.6)
    if k < land + 3:  # and wide open on 25
        return 3200 * (20000 / 3200) ** ((k - land) / 3)
    return None


def filtered_outro(path, start, frames, land):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", f"{start:.3f}", "-i", path, "-t", f"{frames / FPS:.3f}",
         "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
        check=True, capture_output=True,
    ).stdout
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
    out = np.zeros_like(x)
    blk = 256
    zi = None
    for i in range(0, len(x), blk):
        k = (i / SR) * FPS
        fc = cutoff(k, land)
        seg = x[i : i + blk]
        if fc is None:
            out[i : i + blk] = seg
            continue
        sos = butter(4, min(fc, SR / 2 * 0.95), btype="low", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2, 2))
        y, zi = sosfilt(sos, seg, axis=0, zi=zi)
        out[i : i + blk] = y
    return out


def write_stereo(path, st):
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())


for name, (outro, hit_s, track, (first_s, every_s)) in TRACKS.items():
    if os.environ.get("ONLY") and name not in os.environ["ONLY"].split(","):  # ONLY=glorious: just that track
        continue
    rng = np.random.default_rng(25)
    hit = round((hit_s - outro) * FPS)
    land = hit - LAND_BEFORE
    total = hit + 120
    x = np.zeros((int(total / FPS * SR) + SR, 2))
    ticks = [COUNT_FROM] + [k for k in range(COUNT_FROM + 1, land + 1) if count_at(k, land) != count_at(k - 1, land)]
    for j, k in enumerate(ticks[:-1]):  # the last change is 25 itself: that is the landing
        step = (count_at(k, land) - 1) / 24
        s = tick(rng, step) * 0.15
        pan = 0.25 if j % 2 else -0.25  # tic a touch left, tac a touch right
        i = int(k / FPS * SR)
        x[i : i + len(s), 0] += s * (1 - pan)
        x[i : i + len(s), 1] += s * (1 + pan)
    # no sound on 25 itself (Scott: the clunk was in the way, the song's own hit lands it)
    write(f"{OUT}/counter-{name}.wav", room(x, rng), peak_db=-16)
    write_stereo(f"{OUT}/outro-{name}.wav", filtered_outro(track, outro, total, land))
    # the winners board (Scott: "a subtle sound effect on the year's winners"): from the board's
    # first frame, a breath as it comes up, then a soft tick as each award lands; fixed levels
    # (ticks peak near -20 dBFS), not normalised
    rngb = np.random.default_rng(6)
    b = np.zeros(int(9 * SR))
    s = board_swell(rngb)
    b[: len(s)] += s
    for i in range(6):
        k = int((first_s + every_s * i) * SR)
        s = row_tick(rngb)
        b[k : k + len(s)] += s
    write_stereo(f"{OUT}/board-{name}.wav", np.stack([b, b], 1))
    print(name, "hit", hit, "land", land, "ticks", len(ticks) - 1)
