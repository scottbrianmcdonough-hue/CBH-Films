#!/usr/bin/env bash
# Backgrounds for gn-key-fob: each hotel photo cropped to 4:5, thrown out of focus as if
# behind the key on a shallow lens, darkened and warmed to the low light of the scene.
# Usage: scripts/gn-key-bg.sh  (reads public/campaigns/gn-key/hotels, writes .../bg)
set -euo pipefail
src=public/campaigns/gn-key/hotels
dst=public/campaigns/gn-key/bg
mkdir -p "$dst"
for f in "$src"/*.jpg; do
  ffmpeg -loglevel error -y -i "$f" -vf "scale=1080:1350:force_original_aspect_ratio=increase,crop=1080:1350,gblur=sigma=16:steps=3,eq=brightness=-0.06:saturation=0.85:gamma=0.82,colorbalance=rs=0.06:gs=0.02:bs=-0.07:rm=0.05:bm=-0.05" -q:v 3 "$dst/$(basename "$f")"
done
