#!/usr/bin/env bash
# Render a hotel film by composition id and export it as a social-ready MP4.
# Usage: scripts/render-film.sh <film-id> [extra remotion render flags]
# e.g.   scripts/render-film.sh hythe-imperial-story
# Output: out/<film-id>.mp4
set -euo pipefail
id="$1"
shift
npx remotion render "$id" "out/$id.raw.mp4" "$@"
"$(dirname "$0")/to-mp4.sh" "out/$id.raw.mp4" "out/$id.mp4"
echo "Rendered out/$id.mp4"
