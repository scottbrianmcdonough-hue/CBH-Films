# a small dark pill behind SCOTLAND & WALES (the pink line over the sky), text pixels kept
import sys, numpy as np, subprocess, cv2
src, out = sys.argv[1], sys.argv[2]
W, H = 1080, 1350
x0, x1, y0, y1 = 352, 725, 377, 431            # the pill, around the text box 380-697 x 392-415
A, F0, F1, END = 0.6, 56, 66, 118               # darkness; fade in with the typing; held to the cut
pill = np.zeros((H, W), np.float32)
r = (y1 - y0) // 2
cv2.rectangle(pill, (x0 + r, y0), (x1 - r, y1), 1, -1)
cv2.circle(pill, (x0 + r, y0 + r), r, 1, -1); cv2.circle(pill, (x1 - r, y0 + r), r, 1, -1)
big = cv2.resize(pill, (W * 4, H * 4)); pill = cv2.resize(cv2.GaussianBlur(big, (0, 0), 2.5), (W, H), interpolation=cv2.INTER_AREA)  # crisp, antialiased edge
rd = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
wr = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                       '-i', src, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-pix_fmt', 'yuv420p',
                       '-c:a', 'copy', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
n = 0
while True:
    b = rd.stdout.read(W * H * 3)
    if len(b) < W * H * 3: break
    f = np.frombuffer(b, np.uint8).reshape(H, W, 3).astype(np.float32)
    t = 0 if n < F0 or n >= END else min(1, (n - F0) / (F1 - F0))
    if t > 0:
        reg = f[y0 - 4:y1 + 4]
        txt = np.clip((reg[:, :, 0] - reg[:, :, 1] - 20) / 50, 0, 1)   # the pink letters
        a = A * t * pill[y0 - 4:y1 + 4] * (1 - txt)
        f[y0 - 4:y1 + 4] = reg * (1 - a[:, :, None]) + np.array([10, 10, 12], np.float32) * a[:, :, None]
    wr.stdin.write(np.clip(f, 0, 255).astype(np.uint8).tobytes()); n += 1
wr.stdin.close(); wr.wait(); print('frames', n)
