#!/usr/bin/env python3
"""A hand-made depth map for Waterton Park's garden path to the footbridge (white near), for a
stronger push in (Scott: "the cross the bridge, move in more"; "always do by hand, more
precise"): the sky farthest, the hall, the far trees and the lake behind, the lawns and the
path sloping toward the camera, and the big tree and every lamp post one solid block at the
depth of the ground where it stands, so nothing upright leans as the camera pushes in.
Coordinates on the 1920 x 1255 photo."""
import numpy as np
from PIL import Image, ImageDraw

W, H = 1920, 1255
ground = lambda y: 0.25 + np.clip((y - 850) / (H - 850), 0, 1) * 0.65  # the lake's edge to the camera
yy = np.arange(H)[:, None] * np.ones((1, W))
d = np.where(yy >= 850, ground(yy), np.where(yy >= 560, 0.15, 0.0))  # sky, then the hall and trees
img = Image.fromarray((d * 255).astype(np.uint8))
dr = ImageDraw.Draw(img)
v = lambda y: int(ground(y) * 255)
# the big tree on the left, at the depth of its trunk on the lake shore
dr.polygon([(230, 330), (420, 210), (640, 220), (800, 330), (900, 520), (880, 760), (640, 860), (300, 860),
            (230, 600)], fill=v(860))
# the lamp posts either side of the path, nearest pair and the far pair by the bridge
for box, foot in [((690, 915, 800, 1115), 1115), ((1150, 915, 1265, 1115), 1115), ((860, 800, 905, 905), 905),
                  ((1100, 800, 1145, 905), 905)]:
    dr.rectangle(box, fill=v(foot))
img.save(__file__.replace("make-walton-hall-depth.py", "walton-hall-depth.png"))
print("walton-hall-depth.png")
