"""The Black Friday bed photo as a 9:16 frame for the queue reel's end card (Scott, 5 Nov: "crop it better"): the
clean right side of the landscape artwork (her elbows and the headboard whole, x 470-1400), at 1.16x, set below a black
top that fades into the headboard (the type sits there, as on the 4:5 artwork), the duvet carried down the last
~110px by a soft reflection. Writes public/campaigns/black-friday-2026/bed-9x16.jpg."""
from PIL import Image, ImageFilter
import numpy as np
D = "public/campaigns/black-friday-2026/"
im = Image.open(D + "campaign/bed-landscape.jpg").convert("RGB").crop((470, 0, 1400, 1200))
w = 1080; h = round(1200 * w / 930)
im = im.resize((w, h), Image.LANCZOS)
T = 420
out = np.zeros((1920, 1080, 3), float)
a = np.asarray(im, float)
out[T:T + h] = a
# the duvet carried down: the last rows reflected, blurred more the further they go
rest = 1920 - (T + h)
if rest > 0:
    ref = np.asarray(Image.fromarray(a[-rest:][::-1].astype(np.uint8)).filter(ImageFilter.GaussianBlur(10)), float)
    out[T + h:] = ref
    # blend the seam
    k = np.linspace(0, 1, 30)[:, None, None]
    out[T + h - 30:T + h] = a[-30:] * (1 - k * 0.5) + ref[:1] * (k * 0.5)
# black top fading into the headboard over its first 300px
fade = np.clip((np.arange(1920) - T) / 300, 0, 1)[:, None, None]
fade = fade * fade * (3 - 2 * fade)
out = out * fade + 9 * (1 - fade)
Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(D + "bed-9x16.jpg", quality=94)
print("bed-9x16.jpg", h, rest)
