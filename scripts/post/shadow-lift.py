import sys, numpy as np, cv2, subprocess
src, out = sys.argv[1], sys.argv[2]
W, H = 1080, 1350
# shadow lift curve: black stays black, shadows and low mids come up, highlights untouched
x = np.array([0, 10, 40, 80, 130, 190, 255], float)
y = np.array([0, 12, 62, 108, 152, 200, 255], float)
lut = np.interp(np.arange(256), x, y).astype(np.float32)
yy = np.linspace(0, 1, H)[:, None]
mask = np.clip((yy - 0.38) / 0.30, 0, 1); mask = mask * mask * (3 - 2 * mask)  # soft ramp into the lower half
mask = (0.25 + 0.75 * mask)[:, :, None].astype(np.float32)  # a little lift up top too
rd = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], stdout=subprocess.PIPE)
wr = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                       '-i', src, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-pix_fmt', 'yuv420p',
                       '-c:a', 'copy', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
n = 0
while True:
    b = rd.stdout.read(W * H * 3)
    if len(b) < W * H * 3: break
    f = np.frombuffer(b, np.uint8).reshape(H, W, 3).astype(np.float32)
    # lift on luminance only, so colours keep their hue
    lum = f.mean(axis=2, keepdims=True)
    lifted = lut[np.clip(lum, 0, 255).astype(np.uint8)][:, :, 0:1] if False else np.interp(lum, np.arange(256), lut)
    gain = np.where(lum > 1, lifted / np.maximum(lum, 1), 1.0)
    g = 1 + (gain - 1) * mask
    wr.stdin.write(np.clip(f * g, 0, 255).astype(np.uint8).tobytes()); n += 1
wr.stdin.close(); wr.wait(); print('frames', n)
