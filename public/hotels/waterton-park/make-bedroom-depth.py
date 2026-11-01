#!/usr/bin/env python3
"""A hand-made depth map for Waterton Park's four-poster suite (white near): MiDaS read the
furniture as soft blobs, so on the glide the footstool's legs bowed and the armchair's edge
wobbled (Scott: "check the warp"). Here the room is far, the floor slopes toward the camera,
and each piece (the bed, the sofa, the far armchair, the footstool, the near armchair) is one
solid block at the depth of the floor where it stands. Coordinates on the 1920 x 1280 photo."""
import numpy as np
from PIL import Image, ImageDraw

W, H = 1920, 1280
floor = lambda y: 0.3 + np.clip((y - 700) / 580, 0, 1) * 0.55  # back of the room to the camera
yy = np.arange(H)[:, None] * np.ones((1, W))
d = np.where(yy >= 700, floor(yy), 0.15)
img = Image.fromarray((d * 255).astype(np.uint8))
dr = ImageDraw.Draw(img)
v = lambda y: int(floor(y) * 255)
# the bed with its canopy and the bedside tables, standing at the back of the room
dr.polygon([(960, 230), (1515, 230), (1515, 780), (960, 780)], fill=v(780))
# the far armchair by the window
dr.polygon([(500, 590), (725, 590), (725, 845), (500, 845)], fill=v(845))
# the sofa
dr.polygon([(765, 595), (1355, 595), (1360, 860), (1170, 955), (830, 945), (760, 820)], fill=v(950))
# the footstool and its legs
dr.polygon([(598, 722), (1050, 732), (1078, 820), (1050, 905), (1005, 1085), (880, 1152), (800, 1152),
            (780, 905), (620, 905), (598, 780)], fill=v(1120))
# the near armchair, filling the right of the frame
dr.polygon([(1160, 760), (1185, 760), (1500, 748), (1500, 700), (1560, 622), (1920, 612), (1920, 1280),
            (1150, 1280), (1170, 900)], fill=v(1280))
img.save(__file__.replace("make-bedroom-depth.py", "bedroom-depth.png"))
print("bedroom-depth.png")
