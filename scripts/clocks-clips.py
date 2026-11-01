#!/usr/bin/env python3
"""Cut the shots for the clocks-go-back reel ("This Sunday has 25 hours").

Each shot is trimmed from a hotel clip, optionally reversed (the rewind), retimed to fill
its slot exactly, and scaled to 1080x1920 at 30fps, so the film just plays them in order.
Usage: python3 scripts/clocks-clips.py   (writes public/campaigns/clocks-go-back/*.mp4)
"""
import subprocess
from pathlib import Path

H = Path("public/hotels")
OUT = Path("public/campaigns/clocks-go-back")

# name: (source, in, out, reverse, frames). Rewind shots run backwards (0.7-2.3x); the
# extra hour plays at (or near) real speed. Slots follow "Lounge Soul" (two beats a rewind,
# a bar an hour shot). The Kingfisher fork is from its own Instagram reel (720p).
SHOTS = {
    "fork-rewind": ("the-kingfisher/autumn-reel.mp4", 5.87, 6.73, True, 40),
    "dish-rewind": ("fairlawns/dish-and-wine.mp4", 0.3, 2.3, True, 39),
    "syrup-rewind": ("dalmahoy/syrup-pour.mp4", 7.0, 10.0, True, 39),  # the Story
    # ends on 7.0, the frame the forward pour starts from, so the snap is seamless
    "syrup-rewind-long": ("dalmahoy/syrup-pour.mp4", 7.0, 12.0, True, 78),
    "syrup": ("dalmahoy/syrup-pour.mp4", 7.0, 9.6, False, 78),
    "parterre": ("holdsworth-house/parterre.mp4", 0.0, 2.6, False, 78),
    "dog": ("oakley-hall/dog-on-the-lawn.mp4", 8.2, 10.8, False, 78),
    "fireside": ("the-kingfisher/dessert-by-the-fire.mp4", 0.4, 3.03, False, 79),
    "hot-tub": ("ruthin-castle/hot-tub.mp4", 0.0, 2.6, False, 78),
    "bedroom": ("fairlawns/bedroom.mp4", 0.3, 3.57, False, 98),
}


def cut(name, src, t0, t1, reverse, frames):
    speed = (t1 - t0) / (frames / 30)
    chain = [f"trim={t0}:{t1}", "setpts=PTS-STARTPTS"]
    if reverse:
        chain.append("reverse")
    chain += [
        f"setpts=PTS/{speed:.5f}",
        "fps=30",
        "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos",
        "crop=1080:1920",
        "format=yuv420p",
    ]
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(H / src), "-vf", ",".join(chain),
         "-frames:v", str(frames), "-an", "-c:v", "libx264", "-crf", "16",
         "-preset", "slow", str(OUT / f"{name}.mp4")],
        check=True,
    )
    print(f"{name}: {frames} frames at {speed:.2f}x{' reversed' if reverse else ''}")


OUT.mkdir(parents=True, exist_ok=True)
for name, spec in SHOTS.items():
    cut(name, *spec)
