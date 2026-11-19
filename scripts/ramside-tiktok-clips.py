#!/usr/bin/env python3
"""Cut the Ramside Hall reel bank (25fps slider shots) into the TikTok's shots: each conformed to 30fps by
running 1.2x (no duplicated frames), 1080x1920. The four lights are scaled 1.14x and cropped so each hangs
in the middle of the frame (a match cut, a light a beat)."""
import subprocess, os
SRC = "public/hotels/ramside-hall/reel-bank"
OUT = "public/hotels/ramside-hall/tiktok"
os.makedirs(OUT, exist_ok=True)
# name, source, in (s of source), frames out, centre of the subject (fraction) for the match cut
SHOTS = [
    ("treehouses-1", "a-frame-treehouse-drone-01", 0.4, 96, None),
    ("terrace", "ext-009", 2.0, 40, None),
    ("lamp", "ext-010", 2.0, 40, None),
    ("lounge", "int-008", 2.0, 40, None),
    ("green-chairs", "int-004", 2.0, 40, None),
    ("light-1", "int-003", 3.4, 24, (0.48, 0.45)),
    ("light-2", "int-016", 3.4, 24, (0.50, 0.48)),
    ("light-3", "int-021", 3.4, 24, (0.53, 0.56)),
    ("light-4", "int-022", 3.4, 24, (0.50, 0.55)),
    ("yellow-sofa", "int-017", 2.0, 40, None),
    ("fairy-lights", "int-010", 2.0, 40, None),
    ("rib-room", "rib-room-002", 3.0, 40, None),
    ("glasses", "rib-room-006", 3.0, 24, None),
    ("table", "rib-room-003", 2.0, 24, None),
    ("frames", "rib-room-005", 2.0, 40, None),
    ("chalkboard", "rib-room-007", 2.0, 40, None),
    ("breakfast-1", "breakfast-001", 2.0, 40, None),
    ("breakfast-2", "breakfast-002", 1.0, 52, None),
    ("treehouses-2", "a-frame-treehouse-drone-02", 0.4, 110, None),
]
for name, src, t, n, c in SHOTS:
    vf = "setpts=PTS/1.2,fps=30"
    if c:
        w, h = 1232, 2190
        x = round(c[0] * w - 540); y = round(c[1] * h - 960)
        x = max(0, min(w - 1080, x)); y = max(0, min(h - 1920, y))
        vf += f",scale={w}:{h}:flags=lanczos,crop=1080:1920:{x}:{y}"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", f"{SRC}/{src}.mp4", "-vf", vf, "-frames:v", str(n), "-an",
                    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-g", "6", f"{OUT}/{name}.mp4"], check=True)
    print(name)
