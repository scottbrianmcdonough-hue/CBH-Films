#!/usr/bin/env python3
"""Join a reel's picture from shots with hard cuts on exact frames (the depth reels: each still
a camera move with real depth from scripts/still-depth-dolly.py, mixed with real footage).
Every shot is trimmed to its own window, so a short phone clip can play half a bar while a
depth move holds a bar; the last shot can fade to black for the end card, and black frames
can follow it. Output is 1080x1920 (or "size", e.g. "1920x1080" for a landscape cut), 30fps, no
audio (the film lays the music over it).

Config (JSON):
  {"out": "...mp4",
   "shots": [{"src": "a.mp4", "from": 0, "frames": 104}, ...],  # from: the clip's first frame
                                                                  # vf: an optional ffmpeg filter for
                                                                  # that shot (a flat clip lifted)
   "fade": 50,                                                    # last shot fades over these
   "tail": 12}                                                    # black frames after it
Usage: scripts/cut-picture.py <config.json>
"""
import json
import subprocess
import sys

cfg = json.load(open(sys.argv[1]))
shots = cfg["shots"]
fade, tail = cfg.get("fade", 0), cfg.get("tail", 0)
W, H = map(int, cfg.get("size", "1080x1920").split("x"))

inputs, parts = [], []
for i, s in enumerate(shots):
    inputs += ["-i", s["src"]]
    f = f"[{i}:v]trim=start_frame={s.get('from', 0)}:end_frame={s.get('from', 0) + s['frames']},setpts=PTS-STARTPTS,"
    f += f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps=30,format=yuv420p"
    if s.get("vf"):
        f += "," + s["vf"]
    if i == len(shots) - 1 and fade:
        f += f",fade=t=out:start_frame={s['frames'] - fade}:nb_frames={fade}"
    if i == len(shots) - 1 and tail:
        f += f",tpad=stop={tail}:color=black"
    parts.append(f + f"[v{i}]")
graph = ";".join(parts) + ";" + "".join(f"[v{i}]" for i in range(len(shots)))
graph += f"concat=n={len(shots)}:v=1:a=0[out]"
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", graph, "-map", "[out]",
                "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p", cfg["out"]],
               check=True)
total = sum(s["frames"] for s in shots) + tail
print(f"{cfg['out']}: {total} frames")
