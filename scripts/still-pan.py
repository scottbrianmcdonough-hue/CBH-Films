"""A still's slow sideways pan as a 9:16 clip (Rutland's Four Roots desk: its sign is wider than a 9:16 crop, so the
camera reads along it). usage: still-pan.py IN OUT --x0 X --x1 X --frames N [--cy Y] [--h H]"""
import argparse, subprocess
from PIL import Image
ap = argparse.ArgumentParser(); ap.add_argument("inp"); ap.add_argument("out")
ap.add_argument("--x0", type=float, required=True); ap.add_argument("--x1", type=float, required=True)
ap.add_argument("--frames", type=int, required=True); ap.add_argument("--cy", type=float); ap.add_argument("--h", type=float)
a = ap.parse_args()
im = Image.open(a.inp).convert("RGB"); sw, sh = im.size
h = a.h or sh; w = h * 1080 / 1920; cy = a.cy if a.cy is not None else sh / 2
p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "1080x1920", "-r", "30", "-i", "-",
                      "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p", a.out], stdin=subprocess.PIPE)
for f in range(a.frames):
    t = f / max(1, a.frames - 1); t = t * t * (3 - 2 * t) * 0.4 + t * 0.6
    x = a.x0 + (a.x1 - a.x0) * t  # the crop's left edge
    p.stdin.write(im.transform((1080, 1920), Image.EXTENT, (x, cy - h / 2, x + w, cy + h / 2), resample=Image.BICUBIC).tobytes())
p.stdin.close(); p.wait(); print(a.out, a.frames)
