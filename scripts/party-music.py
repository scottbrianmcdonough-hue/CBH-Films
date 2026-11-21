"""The Christmas party reel's sound (Scott: "a festive song like Jingle Bell Rock", "find one within the repos"):
Bring Back the Swing (120 BPM, kick on 7.61s + 0.5k) from a downbeat at 8.11s, sleigh bells on the beat optional (off). Writes public/campaigns/xmas-party-2026/swing.wav. Usage: party-music.py [seconds] [bells 0-1]"""
import sys
import librosa, numpy as np, soundfile as sf
dur = float(sys.argv[1]) if len(sys.argv) > 1 else 59.4
y, sr = librosa.load('public/campaigns/the-mount/bring-back-the-swing.mp3', sr=44100, mono=False)
a = int(8.098 * sr); seg = y[:, a:a + int(dur * sr)].copy(); n = seg.shape[1]
rng = np.random.default_rng(3); bells = np.zeros(n)
def jingle(amp):
    L = int(0.16 * sr); tt = np.arange(L) / sr; x = np.zeros(L)
    for fq in (5200, 6100, 7300, 8600, 9900):
        x += np.sin(2 * np.pi * fq * (1 + rng.normal(0, 0.004)) * tt + rng.uniform(0, 6)) * np.exp(-tt / rng.uniform(0.03, 0.06))
    return amp * (x + 0.5 * rng.normal(0, 1, L) * np.exp(-tt / 0.012)) / 5
for k in range(int(dur / 0.5)):
    for off, amp in ((0.012, 0.5 if k % 2 == 0 else 1.0), (0.262, 0.35)):
        i = int((k * 0.5 + off) * sr); j = jingle(amp)
        if i + len(j) < n: bells[i:i + len(j)] += j
BELLS = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0  # 0: no sleigh bells (Scott: "lose the jingle"); 1 was the first try
bells *= BELLS * 0.175 * np.sqrt(np.mean(seg ** 2)) / np.sqrt(np.mean(bells ** 2))
out = seg + np.vstack([bells * 0.9, bells * 1.1])
fade = np.ones(n); fo = int(1.5 * sr); fade[-fo:] = np.linspace(1, 0, fo); fade[:2000] = np.linspace(0, 1, 2000)
sf.write('public/campaigns/xmas-party-2026/swing.wav', (out * fade).T, sr)
