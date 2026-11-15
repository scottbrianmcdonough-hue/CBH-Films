#!/usr/bin/env bash
# Camera roll reel (`cbh-camera-roll`): the grid's thumbnails are each clip's first frame (so the
# hand-over from the tile to the playing clip doesn't jump), and the music edit.
# Upbeat Dance Pop Infectious (toolikes, Pixabay 225269), 128 BPM, 0.46873s a beat, the groove's first
# kick at 7.555s (film beat 0). The film opens four beats before it; at film beat 24 (song 18.805s) it
# jumps 288 beats on (song 153.799s: the same place in the 24 beat accent cycle) so the track's own final
# hit (165.05s, song beat 336) lands on film beat 48, then its tail rings out. Each side is cut 15ms
# before its kick with a 10ms crossfade, so one kick lands.
set -euo pipefail
cd "$(dirname "$0")/.."
D=public/campaigns/camera-roll
H=public/hotels
for c in ruthin-castle/sumac-and-ruins ruthin-castle/hot-tub \
  rutland-hall/screen-time/lake-sunset rutland-hall/screen-time/candlelit-bath rutland-hall/screen-time/suite-beds \
  rutland-hall/screen-time/loungers rutland-hall/screen-time/treatment-bed rutland-hall/spa-baths \
  low-wood-bay/screen-time/misty-lake-4s low-wood-bay/screen-time/quartet-4s low-wood-bay/screen-time/candles \
  low-wood-bay/screen-time/cello low-wood-bay/screen-time/misty-lake low-wood-bay/screen-time/snowy-rooftops \
  gisborough-hall/screen-time/misty-sunrise gisborough-hall/screen-time/snowy-garden gisborough-hall/screen-time/bedroom \
  gisborough-hall/screen-time/fireplace gisborough-hall/screen-time/lit-doorway gisborough-hall/screen-time/misty-lawn; do
  out="$D/posters/$(echo "$c" | tr '/' '-' | sed 's/-screen-time//').jpg"
  ffmpeg -loglevel error -y -i "$H/$c.mp4" -frames:v 1 -q:v 3 "$out"
done
M=public/music/toolikes-upbeat-dance-pop-infectious-225269.mp3
P=0.46873; K=7.555
A0=$(python3 -c "print(round($K-4*$P,4))")
A1=$(python3 -c "print(round($K+24*$P-0.015,4))")
B0=$(python3 -c "print(round($K+312*$P-0.015-0.01,4))")
ffmpeg -loglevel error -y -i "$M" -filter_complex \
  "[0:a]atrim=start=$A0:end=$A1,asetpts=PTS-STARTPTS[a];[0:a]atrim=start=$B0:end=169.5,asetpts=PTS-STARTPTS[b];\
[a][b]acrossfade=d=0.01:c1=tri:c2=tri,loudnorm=I=-16.4:TP=-1.5:LRA=11,alimiter=limit=0.84:level=disabled" \
  -c:a aac -b:a 256k "$D/upbeat-pop-edit.m4a"
echo "A $A0-$A1  B $B0-"
