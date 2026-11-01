#!/usr/bin/env python3
"""Find the beat grid of a music track so a hotel film can cut on downbeats.

Prints the tempo, then every 4th beat (bar starts) with its time and video frame
at 30fps, marking the strongest bar starts as likely phrase starts, plus the
loudness of the first `--seconds`. Paste the frames you choose into the film's
`cuts`, `durationInFrames` and `music.fadeFrom`.

Requires librosa (pip install librosa).
Usage: scripts/analyze-beats.py <track.mp3> [--seconds 45] [--offset 0] [--bpm 89]
"""

import argparse
import subprocess

import librosa
import numpy as np

FPS = 30

parser = argparse.ArgumentParser()
parser.add_argument("track")
parser.add_argument("--seconds", type=float, default=45, help="how much of the track to analyse")
parser.add_argument("--offset", type=float, default=0, help="where the excerpt starts (s)")
parser.add_argument("--bpm", type=float, help="force the tempo if detection picks double/half time")
args = parser.parse_args()

y, sr = librosa.load(args.track, sr=22050, mono=True, offset=args.offset, duration=args.seconds)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units="time", bpm=args.bpm)
tempo = float(np.atleast_1d(tempo)[0])
if args.bpm is None and tempo > 135:
    # Beat trackers often lock onto double time; hotel-film music sits around 70-130.
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units="time", bpm=tempo / 2)
    tempo = float(np.atleast_1d(tempo)[0])
    print("(detected double time; halved - pass --bpm to override)")
print(f"tempo ~{tempo:.1f} BPM, beat every {60 / tempo:.3f}s, {len(beats)} beats")

# Low-end onset strength at each beat tells us which beat of the bar is the downbeat.
hop = 256
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
low = librosa.onset.onset_strength(S=librosa.amplitude_to_db(S[freqs < 150]), sr=sr, hop_length=hop)
t = librosa.frames_to_time(np.arange(len(low)), sr=sr, hop_length=hop)
strength = np.array([low[max(0, i - 3) : i + 4].max() for i in np.searchsorted(t, beats)])
phase = int(np.argmax([strength[p::4].mean() for p in range(4)]))
print(f"downbeats are beats {phase}, {phase + 4}, {phase + 8}, ... (bar = 4 beats)\n")

bars = list(range(phase, len(beats), 4))
cutoff = np.percentile(strength[bars], 75)
print(" beat    time   frame")
for b in bars:
    mark = "  <- strong (likely phrase start)" if strength[b] >= cutoff else ""
    print(f"{b:5d} {beats[b]:7.3f}s {round(beats[b] * FPS):6d}{mark}")

loud = subprocess.run(
    ["ffmpeg", "-v", "info", "-ss", str(args.offset), "-t", str(args.seconds), "-i", args.track,
     "-af", "ebur128", "-f", "null", "-"],
    capture_output=True, text=True,
).stderr
integrated = [line.split()[1] for line in loud.splitlines() if line.strip().startswith("I:")]
if integrated:
    print(f"\nloudness of the excerpt: {integrated[-1]} LUFS (aim for about -16 to -14)")
