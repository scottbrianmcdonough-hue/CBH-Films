#!/usr/bin/env bash
# Re-encode a Remotion render into a widely compatible MP4 (iPhone/QuickTime,
# Instagram, TikTok, web): H.264 High 4.1, standard-range yuv420p, AAC audio
# (a silent track if the render has none), and faststart. NO_AUDIO=1 drops audio altogether
# (silent LinkedIn videos: Scott wanted the empty track stripped).
# Usage: [NO_AUDIO=1] scripts/to-mp4.sh <input.mp4> <output.mp4>
set -euo pipefail
if [ "${NO_AUDIO:-}" = 1 ]; then
  audio=(-map 0:v -an)
elif ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$1" | grep -q .; then
  audio=(-map 0:v -map 0:a)
else
  audio=(-f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 -map 0:v -map 1:a -shortest)
fi
ffmpeg -v error -y -i "$1" "${audio[@]}" \
  -vf "scale=in_range=full:out_range=tv,format=yuv420p" \
  -c:v libx264 -profile:v high -level:v 4.1 -preset slow -crf 18 -color_range tv \
  $([ "${NO_AUDIO:-}" = 1 ] || echo "-c:a aac -b:a 192k -ar 48000") -movflags +faststart "$2"
rm -f "$1"
