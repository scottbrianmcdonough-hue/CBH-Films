"""Lift Lily's lowercase "teenage psycho" and its spark lines off the sketch, ink only."""
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
S = 4
src = Image.open("sketch.png").convert("L").crop((420, 520, 770, 700))
big = src.resize((src.width * S, src.height * S), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.0))
g = np.asarray(big).astype(float)
ink = g < 92
lab, n = ndi.label(ink)
sizes = ndi.sum(ink, lab, range(1, n + 1))
keep = np.zeros(n + 1, bool); keep[1:] = sizes > 300
ink = keep[lab]
inkmask = ndi.binary_dilation(ink, iterations=1)
a = np.where(inkmask, np.clip((128 - g) / 70.0, 0, 1), 0)
out = np.zeros(g.shape + (4,), np.uint8)
out[..., :3] = 20
out[..., 3] = (a * 255).astype(np.uint8)
im = Image.fromarray(out, "RGBA")
im = im.crop(im.getbbox())
im.save("small-title-ink.png"); print(im.size)
