#!/usr/bin/env python3
"""Cut and grade the shots for the Hatherley Manor festive reel (hatherley-christmas).

Each shot is cut from the Reel Bank clips (public/hotels/hatherley-manor/reel-bank/), slowed where a
short Instagram cut has to fill its slot (minterpolate to 30fps, never playbackRate), scaled to
1080x1920 and given the festive grade: warm and candlelit (shadows and mids pulled to amber, blue
down), a touch more contrast, and a soft glow from the highlights only (lights bloom, the rest stays
clean). Stills go through scripts/kenburns.py (Pillow LANCZOS, the same barely-there push every time)
and then the same grade. Output: public/hotels/hatherley-manor/festive/<name>.mp4.

Usage: python3 scripts/hatherley-festive-clips.py [name ...]
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public/hotels/hatherley-manor/reel-bank")
STILLS = os.path.join(ROOT, "public/hotels/hatherley-manor/stills")
OUT = os.path.join(ROOT, "public/hotels/hatherley-manor/festive")
PAD = 12  # frames beyond the slot: half a crossfade before and after, all inside the source shot

# name: (clip, start seconds, frames on screen, speed). Speed < 1 slows with motion interpolation.
CLIPS = {
    "tree-bow": ("festive-tree-lounge.mp4", 10.45, 66, 1.0),  # the hook: up the tree to its big red bow
    "tree": ("festive-tree-lounge.mp4", 0.10, 99, 1.0),  # the tree, panning to the Christmas sofa
    "spa": ("spa-day.mp4", 11.20, 98, 1.0),  # the hydro pool under its cascade (from behind)
    "breakfast": ("stay-day-reel.mp4", 31.08, 49, 0.73),  # breakfast overhead
    "egg": ("stay-day-reel.mp4", 35.68, 49, 0.73),  # toast into the egg
    "lunch": ("roast-and-spa-360p.mp4", 12.20, 99, 1.0),  # roast plates (360p source)
    "dog-table": ("dog-stay-reel.mp4", 31.86, 49, 0.51),  # the spaniel at the table
    "dog-walk": ("dog-stay-reel.mp4", 10.13, 49, 0.41),  # the spaniel trotting up to camera
    "fizz": ("spa-day.mp4", 2.75, 90, 1.0),  # fizz poured beside the cake
}
# name: (still, crop centre x, frames on screen)
STILL_SHOTS = {
    "lounge-bar": ("lounge-bar.jpg", 760, 90),  # the bar and the blue sofa (not in the cut)
    "bedroom": ("superior-spa-double.jpg", 1000, 150),  # Superior Spa Double: the last shot, fading to black
    "thyme": ("thyme-restaurant.jpg", 1250, 98),  # the set tables under the wall light
}

# warm candlelit grade + highlight glow
GRADE = (
    "eq=contrast=1.05:saturation=1.08:gamma=0.98,"
    "colorbalance=rs=0.05:gs=0.01:bs=-0.06:rm=0.04:gm=0.0:bm=-0.05:rh=0.02:bh=-0.04,"
    "split[a][b];[b]curves=all='0/0 0.62/0 1/1',gblur=sigma=28[g];"
    "[a][g]blend=all_mode=screen:all_opacity=0.32,format=yuv420p"
)


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        sys.exit(r.stderr[-2000:])


def clip(name, src, start, frames, speed):
    n = frames + PAD
    dur = n / 30 * speed + 0.2
    vf = f"setpts=(PTS-STARTPTS)/{speed},"
    if speed < 1:
        vf += "minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,"
    else:
        vf += "fps=30,"
    if name == "lunch":  # lose the diner's face along the top: 1.14x, anchored to the bottom
        vf += "crop=iw/1.14:ih/1.14:(iw-iw/1.14)/2:ih-ih/1.14,"
    vf += "scale=1080:1920:flags=lanczos,"
    if "360p" in src:
        vf += "unsharp=5:5:0.6,"
    vf += GRADE
    out = os.path.join(OUT, f"{name}.mp4")
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{start}", "-t", f"{dur}", "-i", os.path.join(SRC, src),
         "-an", "-filter_complex", vf, "-frames:v", str(n), "-c:v", "libx264", "-crf", "14",
         "-preset", "slow", "-movflags", "+faststart", out])
    print(out, n, "frames")


def still(name, src, cx, frames):
    n = frames + PAD
    raw = os.path.join("/dev/shm", f"hm-{name}.mp4")
    # the same barely-there push on every still: 1.00 -> 1.04, no drift
    run([sys.executable, os.path.join(ROOT, "scripts/kenburns.py"), os.path.join(STILLS, src), raw,
         "--cx", str(cx), "--frames", str(n), "--z0", "1.0", "--z1", "1.04", "--over", str(n),
         "--drift", "0"])
    out = os.path.join(OUT, f"{name}.mp4")
    run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-filter_complex", GRADE, "-c:v", "libx264",
         "-crf", "14", "-preset", "slow", "-movflags", "+faststart", out])
    os.remove(raw)
    print(out, n, "frames")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    want = set(sys.argv[1:])
    for k, v in CLIPS.items():
        if not want or k in want:
            clip(k, *v)
    for k, v in STILL_SHOTS.items():
        if not want or k in want:
            still(k, *v)
