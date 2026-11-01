"""Blur the slide in a stage clip, frame by frame, keeping the people in front of it sharp.

The slide is found by its colour (a pale green-cyan screen against the orange stage): its pixels,
closed into one shape and filled to their convex hull; inside it, large non-slide blobs (a speaker
standing in front) are cut back out so they stay sharp; the box is smoothed over time so the blur
doesn't twitch. Used for the Colour Energies talk in the AMC 16:9 film (Scott: "blur Nick's slide
about the colours"):
  python3 scripts/blur-slide.py in.mp4 start_s dur_s out.mp4 [preview_dir]
(the handshake: 20261019_135815 from 15.45s for 3.0s)
"""

import subprocess
import sys

import cv2
import numpy as np

src, start, dur, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
preview = sys.argv[5] if len(sys.argv) > 5 else None
W, H = 1920, 1080

# decode every frame the phone recorded (60fps, variable), with no resampling
raw = subprocess.run(
    ["ffmpeg", "-v", "error", "-ss", str(start), "-t", str(dur), "-i", src, "-vf", f"scale={W}:{H}",
     "-vsync", "passthrough", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
    capture_output=True, check=True).stdout
src_frames = np.frombuffer(raw, dtype=np.uint8).reshape(-1, H, W, 3)

# The phone freezes for a few frames and then jumps on (Scott: "two jitters at the very beginning").
# Drop the repeats, then retime what is left so the motion runs at an even speed (each step's time
# from how far the picture moved, kept within 0.6-1.8x a frame), and sample 30fps by blending the two
# nearest source frames: no freeze, no jump, no warped interpolation.
small = np.stack([cv2.resize(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), (192, 108)).astype(np.float32)
                  for f in src_frames])
diff = np.r_[1.0, np.abs(np.diff(small, axis=0)).mean(axis=(1, 2))]
keep = [i for i in range(len(src_frames)) if diff[i] > 0.3]
moved = np.array([np.abs(small[keep[j]] - small[keep[j - 1]]).mean() for j in range(1, len(keep))])
times = np.r_[0.0, np.cumsum(np.clip(moved / np.median(moved), 0.6, 1.8) / 60)]
frames = []
for k in range(int(times[-1] * 30)):
    t = k / 30
    j = min(int(np.searchsorted(times, t, side="right")) - 1, len(keep) - 2)
    a = (t - times[j]) / (times[j + 1] - times[j])
    f0, f1 = src_frames[keep[j]].astype(np.float32), src_frames[keep[j + 1]].astype(np.float32)
    frames.append((f0 * (1 - a) + f1 * a + 0.5).astype(np.uint8))

def slide_mask(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    m = ((h >= 35) & (h <= 100) & (s >= 25) & (v >= 120)).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
    if n < 2:
        return None, None
    k = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    if stats[k, cv2.CC_STAT_AREA] < W * H * 0.02:
        return None, None
    blob = (lab == k).astype(np.uint8) * 255
    hull = cv2.convexHull(cv2.findNonZero(blob))
    return blob, hull

hulls = [slide_mask(f)[1] for f in frames]
# smooth each hull's bounding polygon over time: use its 4 extreme corners, median over a window
boxes = []
for hl in hulls:
    if hl is None:
        boxes.append(None)
        continue
    x, y, w, h = cv2.boundingRect(hl)
    boxes.append((x, y, x + w, y + h))
good = [b for b in boxes if b is not None]
sm = []
for i in range(len(boxes)):
    win = [boxes[j] for j in range(max(0, i - 3), min(len(boxes), i + 4)) if boxes[j] is not None]
    sm.append(tuple(int(np.median([b[k] for b in win])) for k in range(4)) if win else None)

proc = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", "30",
     "-i", "-", "-an", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out],
    stdin=subprocess.PIPE)
for i, f in enumerate(frames):
    img = f.copy()
    b = sm[i]
    if b is not None:
        x0, y0, x1, y1 = b
        # the screen is 16:9: its right side can wash out to near-white and escape the colour mask
        x1 = max(x1, x0 + int((y1 - y0) * 1.82))
        pad = 12
        x0, y0, x1, y1 = max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad)
        # blur only the screen's own pixels (its pale green-cyan, and the washed-out near-white at its
        # right side), closed over its text, so anything in front of it (a head, a suit) stays sharp
        # (Scott: "clean up the blur over Phil's head")
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        hh, ss, vv = hsv[..., 0], hsv[..., 1], hsv[..., 2]
        screen = (((hh >= 35) & (hh <= 100) & (ss >= 25) & (vv >= 120)) | ((ss < 50) & (vv > 205))).astype(np.uint8)
        box = np.zeros((H, W), np.uint8)
        box[y0:y1, x0:x1] = 1
        screen = screen * box * 255
        screen = cv2.morphologyEx(screen, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (41, 41)))
        # fill small holes (text, icons); leave big ones (people) sharp
        inv = cv2.bitwise_not(screen) * box
        n, lab, stats, _ = cv2.connectedComponentsWithStats(inv)
        for k in range(1, n):
            if stats[k, cv2.CC_STAT_AREA] < 16000:  # text and the slide's icons; a person (head and body) is far bigger
                screen[lab == k] = 255
        screen = cv2.erode(screen, np.ones((5, 5), np.uint8))
        mask = cv2.GaussianBlur(screen, (21, 21), 0).astype(np.float32)[..., None] / 255
        blurred = cv2.GaussianBlur(img, (0, 0), 22)
        img = (img * (1 - mask) + blurred * mask).astype(np.uint8)
    proc.stdin.write(img.tobytes())
    if preview and i % 10 == 0:
        cv2.imwrite(f"{preview}/b{i:03d}.jpg", cv2.resize(img, (640, 360)))
proc.stdin.close()
proc.wait()
print(len(frames), "frames,", sum(1 for b in sm if b is None), "without a slide found")
