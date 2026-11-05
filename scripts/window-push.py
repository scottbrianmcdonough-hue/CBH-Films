"""A still's slow push made for the Black Friday queue's "While you wait" window: the window shows only the
middle of a 1080 x 1920 clip (x 220-860, y 500-1160), so the photo is fitted to that region alone, at close to
its own resolution, instead of being cropped to 9:16 and enlarged (the rest of the frame is a dark blurred copy,
never seen). usage: window-push.py IN OUT --cx 0.5 --cy 0.5 --frames N [--drift 0.06] [--fill 1.0]
--cx/--cy: the point of the photo at the window's centre (0-1); --fill: how much of the photo's largest window
shaped crop to use (smaller pushes in)."""
import argparse, subprocess
from PIL import Image, ImageFilter
WIN = (220, 500, 640, 660)
ap = argparse.ArgumentParser()
ap.add_argument("inp"); ap.add_argument("out")
ap.add_argument("--cx", type=float, default=0.5); ap.add_argument("--cy", type=float, default=0.5)
ap.add_argument("--frames", type=int, required=True); ap.add_argument("--drift", type=float, default=0.06)
ap.add_argument("--fill", type=float, default=1.0)
a = ap.parse_args()
im = Image.open(a.inp).convert("RGB")
sw, sh = im.size
wx, wy, ww, wh = WIN
# the largest crop with the window's shape
ch = min(sh, sw * wh / ww) * a.fill
cw = ch * ww / wh
cx = min(max(a.cx * sw, cw / 2), sw - cw / 2)
cy = min(max(a.cy * sh, ch / 2), sh - ch / 2)
bg = im.resize((1080, 1920)).filter(ImageFilter.GaussianBlur(40)).point(lambda v: v * 0.35)
p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "1080x1920",
                      "-r", "30", "-i", "-", "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p", a.out],
                     stdin=subprocess.PIPE)
for f in range(a.frames):
    t = f / max(1, a.frames - 1)
    z = 1 + a.drift * t
    w, h = cw / z, ch / z
    box = (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
    fr = bg.copy()
    fr.paste(im.transform((ww, wh), Image.EXTENT, box, resample=Image.BICUBIC), (wx, wy))
    p.stdin.write(fr.tobytes())
p.stdin.close(); p.wait()
print(a.out, a.frames, f"crop {cw:.0f}x{ch:.0f} -> {ww}x{wh}")
