#!/usr/bin/env python3
"""Nailcote Hall meetings and events film (`nailcote-hall-meetings`, 16:9, and
`nailcote-hall-meetings-reel`, 9:16): hand-made depth maps, the camera moves for both sizes, and
the two cut lists, all from the track's beat grid. Then scripts/cut-picture.py joins each.

Depth maps are drawn as smooth shapes (the house rule: by hand, no model): a room's ceiling and
floor coming toward the camera with the far wall flat, a table top as a ramp, a landscape's
ground as a ramp under a flat sky. No edges to bend, so nothing warps.

Usage (from the repo root): python3 public/hotels/nailcote-hall/make-clips.py [--only id,id] [--cut]
"""
import argparse
import json
import os
import subprocess

import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "../../.."))
DEPTH = os.path.join(HERE, "depth")
CLIPS = {"tall": os.path.join(HERE, "clips"), "wide": os.path.join(HERE, "clips-wide")}
SIZE = {"tall": "1080x1920", "wide": "1920x1080"}

# Tech House Vibes (Mixkit 130), ~122 BPM: beat n at 0.088 + n x 0.49181 s (a line fitted to
# librosa's beats 17-120, worst miss 15ms; n as scripts/analyze-beats.py numbers them, so beats 1,
# 5, 9 are the downbeats). The film starts on beat 21 (10.416s, the intro), the full groove lands
# on beat 33 (16.318s) with the first room.
BEAT0, BEAT = 0.088, 0.49181
START_BEAT = 21
START = BEAT0 + START_BEAT * BEAT


def f(beat):  # film frame of a beat
    return round((BEAT0 + beat * BEAT - START) * 30)


def room(name, ceil_to=0.3, floor_from=0.55, far=0.15, ceil_near=0.45, floor_near=0.9):
    img = Image.open(os.path.join(HERE, name + ".jpg"))
    W, H = img.size
    yy = np.arange(H, dtype=np.float32)[:, None] / H
    ceil = far + (ceil_near - far) * np.clip(1 - yy / ceil_to, 0, 1) ** 1.5
    floor = far + (floor_near - far) * np.clip((yy - floor_from) / (1 - floor_from), 0, 1)
    return np.maximum(ceil, floor) * np.ones((1, W), np.float32)


def table(name, top=0.25, far=0.2, near=0.85):  # a table top running toward the camera
    img = Image.open(os.path.join(HERE, name + ".jpg"))
    W, H = img.size
    yy = np.arange(H, dtype=np.float32)[:, None] / H
    return (far + (near - far) * np.clip((yy - top) / (1 - top), 0, 1)) * np.ones((1, W), np.float32)


def land(name, horizon=0.45, far=0.08, near=0.9):  # flat sky, the ground a ramp to the camera
    img = Image.open(os.path.join(HERE, name + ".jpg"))
    W, H = img.size
    yy = np.arange(H, dtype=np.float32)[:, None] / H
    g = np.clip((yy - horizon) / (1 - horizon), 0, 1) ** 0.8
    return (far + (near - far) * g) * np.ones((1, W), np.float32)


def flat(name):
    img = Image.open(os.path.join(HERE, name + ".jpg"))
    return np.full((img.size[1], img.size[0]), 0.3, np.float32)


def framed_tea():
    """The afternoon tea is a 900 x 1350 portrait: for 16:9 it stands whole at the frame's height
    over a soft, darkened copy of itself (not enlarged past 1.25x)."""
    src = Image.open(os.path.join(HERE, "afternoon-tea.jpg")).convert("RGB")
    W, H = 2160, 1215  # a little over 1920 x 1080 for the push
    bg = src.resize((W, round(W * src.size[1] / src.size[0]))).crop((0, 300, W, 300 + H))
    bg = bg.filter(ImageFilter.GaussianBlur(40)).point(lambda v: int(v * 0.42))
    fg = src.resize((round(H * src.size[0] / src.size[1]), H), Image.LANCZOS)
    bg.paste(fg, ((W - fg.size[0]) // 2, 0))
    bg.save(os.path.join(HERE, "afternoon-tea-wide.jpg"), quality=95)


# the shots, in order: id, photo, depth, beats, tall crop centre x (source px), move, and the
# 16:9 cut's own photo where it differs. Rooms push in at one speed (the tables in the same
# place: a match cut across the run); everything else glides.
PUSH = dict(z0=1.0, z1=1.07, glide=0, parallax=36, dolly=0.035)
GLIDE = dict(z0=1.04, z1=1.08, glide=110, parallax=55, dolly=0.03)
SHOTS = [
    # the house on the track's intro (the label), then the pad and pencil
    ("exterior", "exterior", ("land", 0.5), 8, 960, GLIDE, None),
    ("pad", "rooms/pad-and-pencil", ("table", 0.0), 4, 1150, dict(GLIDE, glide=-110, parallax=40), None),
    # the ten spaces, smallest to largest, a bar each, from the groove (beat 33)
    ("boardroom", "rooms/boardroom", ("room", 0.32, 0.62), 4, 1000, PUSH, None),
    ("library", "rooms/library", ("room", 0.3, 0.6), 4, 1150, PUSH, None),
    ("yew", "rooms/yew-suite", ("room", 0.25, 0.55), 4, 950, PUSH, None),
    ("wellingtonia", "rooms/wellingtonia-suite-1", ("room", 0.3, 0.5), 4, 1000, PUSH, None),
    ("dudley", "rooms/dudley-suite", ("room", 0.28, 0.5), 4, 1050, PUSH, None),
    ("kenilworth", "rooms/kenilworth-suite-2", ("room", 0.32, 0.55), 4, 1000, PUSH, None),
    ("terrace", "rooms/terrace-suite-1", ("room", 0.2, 0.5), 4, 1000, PUSH, None),
    ("pavilion", "rooms/clubhouse-pavilion-theatre", ("room", 0.3, 0.5), 4, 1380, PUSH, None),
    ("lant", "rooms/lant-suite-1", ("room", 0.35, 0.5), 4, 1000, PUSH, None),
    ("marquee", "rooms/marquee-day", ("room", 0.35, 0.5), 4, 1000, PUSH, None),
    # where it is, lunch, the break, the drink, the golf, the night
    ("clubhouse", "clubhouse-pond", ("land", 0.55), 4, 750, GLIDE, None),
    ("oak-room", "oak-room-table", ("table", 0.45), 4, 1150, dict(GLIDE, glide=-110), None),
    ("scallops", "scallops", ("table", 0.0), 2, 900, dict(GLIDE, glide=90, parallax=30), None),
    ("terrine", "terrine-jar", ("table", 0.0), 2, 1250, dict(GLIDE, glide=-90, parallax=30), None),
    ("tea", "afternoon-tea", ("table", 0.55), 4, 450, dict(GLIDE, glide=40, parallax=40), "afternoon-tea-wide"),
    ("bar", "rooms/charleys-bar", ("room", 0.3, 0.55), 4, 700, GLIDE, None),
    ("golf", "golf-rhododendrons", ("land", 0.42), 4, 900, GLIDE, "golf-green-pond"),
    ("four-poster", "bedroom-four-poster", ("room", 0.2, 0.6), 6, 700, dict(GLIDE, glide=-110), None),
]
END_BEAT = 111  # the film ends here: two bars of end card after the four poster's fade


def depth_for(photo, spec):
    kind, *args = spec
    return {"room": room, "table": table, "land": land, "flat": flat}[kind](photo, *args)


def render(sid, photo, spec, frames, cx_tall, move, wide_photo, which):
    p = wide_photo if (which == "wide" and wide_photo) else photo
    src = os.path.join(HERE, p + ".jpg")
    W, H = Image.open(src).size
    d = depth_for(p, spec if not (which == "wide" and wide_photo == "afternoon-tea-wide") else ("table", 0.55))
    os.makedirs(DEPTH, exist_ok=True)
    dpath = os.path.join(DEPTH, sid + ("-wide" if which == "wide" and wide_photo else "") + ".png")
    Image.fromarray((np.clip(d, 0, 1) * 255).astype(np.uint8)).save(dpath)
    if which == "tall":
        h, cx = H, cx_tall
        cx = min(max(cx, h * 9 / 16 / 2 * 1.1), W - h * 9 / 16 / 2 * 1.1)
    else:
        h, cx = min(H, W * 9 / 16), W / 2
    glide = move["glide"] * (1 if which == "tall" else 1.6)
    out = os.path.join(CLIPS[which], sid + ".mp4")
    os.makedirs(CLIPS[which], exist_ok=True)
    cmd = ["python3", os.path.join(ROOT, "scripts/still-depth-dolly.py"), src, out, "--cx", str(cx - glide / 2),
           "--h", str(h), "--frames", str(frames), "--z0", str(move["z0"]), "--z1", str(move["z1"]),
           "--glide", str(glide), "--parallax", str(move["parallax"]), "--dolly", str(move["dolly"]),
           "--depth-img", dpath, "--size", SIZE[which]]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL)
    print(which, sid, frames)


def cut_list(which):
    shots, beat = [], START_BEAT
    for sid, *_rest in SHOTS:
        beats = _rest[2]
        shots.append({"src": os.path.relpath(os.path.join(CLIPS[which], sid + ".mp4"), ROOT), "from": 0,
                      "frames": f(beat + beats) - f(beat)})
        beat += beats
    tail = f(END_BEAT) - f(beat)
    return {"out": os.path.relpath(os.path.join(HERE, f"picture-{which}.mp4"), ROOT), "size": SIZE[which],
            "shots": shots, "fade": 40, "tail": tail}


ap = argparse.ArgumentParser()
ap.add_argument("--only")
ap.add_argument("--cut", action="store_true", help="only write the cut lists and join the pictures")
ap.add_argument("--which", default="tall,wide")
a = ap.parse_args()
only = set(a.only.split(",")) if a.only else None
if not a.cut:
    framed_tea()
    beat = START_BEAT
    for sid, photo, spec, beats, cx, move, wide_photo in SHOTS:
        frames = f(beat + beats) - f(beat) + 4
        beat += beats
        if only and sid not in only:
            continue
        for which in a.which.split(","):
            render(sid, photo, spec, frames, cx, move, wide_photo, which)
# the timeline, printed for the spec: each shot's first film frame
beat = START_BEAT
for sid, _p, _s, beats, *_r in SHOTS:
    print(f"{sid:12s} beat {beat:3d} frame {f(beat)}")
    beat += beats
print(f"{'end':12s} beat {beat:3d} frame {f(beat)}; film ends beat {END_BEAT} frame {f(END_BEAT)}")
for which in a.which.split(","):
    cfg = cut_list(which)
    path = os.path.join(HERE, f"cut-{which}.json")
    json.dump(cfg, open(path, "w"), indent=1)
    if a.cut or not only:
        subprocess.run(["python3", os.path.join(ROOT, "scripts/cut-picture.py"), path], check=True, cwd=ROOT)
