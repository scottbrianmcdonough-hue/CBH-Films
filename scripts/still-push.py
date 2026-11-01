"""A still's slow push as a clip, rendered frame by frame in PIL with sub-pixel precision (the
browser's scaled <Img> stepped and shimmered on fine patterns: Scott, "a weird jitter").
usage: still-push.py IN OUT --cx X [--cy Y] [--h H] --drift D --frames N [--w 1080 --hgt 1920]"""
import argparse, subprocess
from PIL import Image
ap = argparse.ArgumentParser()
ap.add_argument("inp"); ap.add_argument("out")
ap.add_argument("--cx", type=float, required=True); ap.add_argument("--cy", type=float)
ap.add_argument("--h", type=float); ap.add_argument("--drift", type=float, default=0.05)
ap.add_argument("--frames", type=int, required=True)
ap.add_argument("--w", type=int, default=1080); ap.add_argument("--hgt", type=int, default=1920)
a = ap.parse_args()
im = Image.open(a.inp).convert("RGB")
sw, sh = im.size
ch = a.h or sh
cw = ch * a.w / a.hgt
cy = a.cy if a.cy is not None else sh / 2
p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{a.w}x{a.hgt}",
                      "-r", "30", "-i", "-", "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p", a.out],
                     stdin=subprocess.PIPE)
for f in range(a.frames):
    t = f / max(1, a.frames - 1)
    t = t * t * (3 - 2 * t) * 0.35 + t * 0.65  # a gentle ease in and out on a near-constant push
    z = 1 + a.drift * t
    w, h = cw / z, ch / z
    box = (a.cx - w / 2, cy - h / 2, a.cx + w / 2, cy + h / 2)
    fr = im.transform((a.w, a.hgt), Image.EXTENT, box, resample=Image.BICUBIC)
    p.stdin.write(fr.tobytes())
p.stdin.close(); p.wait()
print(a.out, a.frames)
