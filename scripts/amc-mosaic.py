"""AMC 2026 mosaic (Scott, 21 Oct: "a cool collage with the best photos, not just three ... or a
gif even"). Eleven of the day's photos in a 4:5 grid of mixed tile sizes, day to night: the
Stronger Together room and the lectern on top, then the welcome stand, the sales panel and the
balloons, then the gala team shot large with the winners, Table 3 and the dance floor beside it.
Thin black gutters, the gala post's light finish.

Writes OUT.jpg (1080 x 1350) and OUT.gif / OUT.mp4: the tiles arrive one by one in the day's
order, each easing up from a little smaller, then the full mosaic holds.

  python3 scripts/amc-mosaic.py ASSET_DIR OUT_BASE
"""
import subprocess
import sys
import tempfile

import cv2
import numpy as np
from PIL import Image, ImageOps

d, out = sys.argv[1:3]
W, H, G = 1080, 1350, 6
A, B = 430, 300
C = H - A - B - 2 * G
L = 714  # the wide tiles on rows A and C
R = W - L - G
T = (W - 2 * G) // 3  # row B thirds
c1 = (C - 2 * G) // 3

# (file, (x, y, w, h), crop box in the photo or None, vertical centring, shadow lift)
TILES = [
    ("welcome-stand.jpg", (0, A + G, T, B), (270, 210, 1530, 1470), 0.4, 0.0),
    ("stronger-together-room.jpg", (0, 0, L, A), None, 0.5, 0.03),
    ("speaker-lectern.jpg", (L + G, 0, R, A), None, 0.33, 0.02),
    ("sales-panel.jpg", (T + G, A + G, T, B), (0, 0, 1400, 1200), 0.5, 0.02),
    ("team-balloons-25-years-wide.jpg", (2 * (T + G), A + G, W - 2 * (T + G), B),
     (0, 110, 1200, 1310), 0.45, 0.03),
    ("team-gala.webp", (0, A + B + 2 * G, L, C), None, 0.55, 0.03),
    ("winners-stage.jpg", (L + G, A + B + 2 * G, R, c1), None, 0.5, 0.06),
    ("table-3-selfie.jpg", (L + G, A + B + 3 * G + c1, R, c1), None, 0.45, 0.02),
    ("dance-floor.jpg", (L + G, A + B + 4 * G + 2 * c1, R, C - 2 * c1 - 2 * G), None, 0.4, 0.03),
]


def finish(im, lift):
    lab = cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2LAB)
    L_ = lab[..., 0].astype(np.float32)
    L_ = 0.7 * L_ + 0.3 * cv2.createCLAHE(1.6, (8, 8)).apply(lab[..., 0]).astype(np.float32)
    L_ = L_ + lift * 255 * (1 - L_ / 255) ** 2
    lab[..., 0] = np.clip(L_, 0, 255).astype(np.uint8)
    return Image.fromarray(cv2.cvtColor(lab, cv2.COLOR_LAB2RGB))


tiles = []
for f, (x, y, w, h), box, cy, lift in TILES:
    im = ImageOps.exif_transpose(Image.open(f"{d}/{f}")).convert("RGB")
    if box:
        im = im.crop(box)
    im = ImageOps.fit(im, (w, h), Image.LANCZOS, centering=(0.5, cy))
    tiles.append(((x, y), finish(im, lift)))

still = Image.new("RGB", (W, H), (0, 0, 0))
for (x, y), im in tiles:
    still.paste(im, (x, y))
still.save(f"{out}.jpg", quality=94)

# the build: a tile every 5 frames at 15 fps, each easing in over 6 frames, then a hold
FPS, EVERY, IN, HOLD = 15, 5, 6, 45
n = len(tiles) * EVERY + IN + HOLD
with tempfile.TemporaryDirectory() as tmp:
    for i in range(n):
        f = Image.new("RGB", (W, H), (0, 0, 0))
        for k, ((x, y), im) in enumerate(tiles):
            t = min(1.0, max(0.0, (i - k * EVERY) / IN))
            if t <= 0:
                continue
            e = 1 - (1 - t) ** 3
            s = 0.9 + 0.1 * e
            w, h = im.size
            sw, sh = round(w * s), round(h * s)
            t_im = im.resize((sw, sh), Image.BILINEAR)
            mask = Image.new("L", (sw, sh), round(255 * e))
            f.paste(t_im, (x + (w - sw) // 2, y + (h - sh) // 2), mask)
        f.save(f"{tmp}/f{i:03d}.png")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", f"{tmp}/f%03d.png",
                    "-vf", "scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=200[p];"
                    "[b][p]paletteuse=dither=sierra2_4a", "-loop", "0", f"{out}.gif"], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", f"{tmp}/f%03d.png",
                    "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "18",
                    "-movflags", "+faststart", f"{out}.mp4"], check=True)
print("ok", n, "frames")
