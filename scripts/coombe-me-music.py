"""Edit Jazz Cocktail Lounge Music for the Coombe Abbey M&E reel (see src/hotels/coombe-abbey-me.ts).
Beats 73 to 121 (the band, its stop, its return), then from beat 281 to the end (the return, the last hits, the chord),
each cut 15ms before the beat so one kick lands."""
import subprocess, librosa
f = 'public/stings/jazz-cocktail-lounge.mp3'
y, sr = librosa.load(f, sr=22050)
_, bf = librosa.beat.beat_track(onset_envelope=librosa.onset.onset_strength(y=y, sr=sr), sr=sr)
bt = librosa.frames_to_time(bf, sr=sr)
a0, a1, b0 = bt[73] - .015, bt[121] - .015, bt[281] - .015
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', f, '-filter_complex',
                f"[0:a]atrim={a0:.3f}:{a1:.3f},asetpts=PTS-STARTPTS[a];[0:a]atrim={b0:.3f}:164.2,asetpts=PTS-STARTPTS[b];"
                "[a][b]acrossfade=d=0.012:c1=tri:c2=tri", '-c:a', 'aac', '-b:a', '256k',
                'public/music/edits/coombe-me-jazz-cocktail.m4a'], check=True)
