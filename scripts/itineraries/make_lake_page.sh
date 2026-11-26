#!/bin/bash
# Build the Lake District itinerary mock-up end to end, always tidy:
# page -> bold pass -> tidy (single file + site folder: index.html, css/, images/) -> PDF -> zip.
# Then run compare.js to check the tidy versions render identical to the untidied page.
set -euo pipefail
R=$(cd "$(dirname "$0")/../.." && pwd)
S=$R/scripts/itineraries
IMG=$R/public/itineraries/lake-district
D=$R/out/itineraries
O=$D/lake-district-itinerary-page-mockup.html
SITE=$D/lake-district-itinerary-site
mkdir -p "$D"
python3 "$S/build_lake_page_site.py" "$IMG" "$R/public/brand/cbh-logo-on-light.svg" "$O"
python3 "$S/scan_bold.py" "$O"
cp "$O" /dev/shm/before.html   # the untidied page, for compare.js
rm -rf "$SITE"
python3 "$S/tidy_site.py" "$O" "$IMG" "$SITE"
node "$S/pdfit.js"
(cd "$D" && rm -f lake-district-itinerary-site.zip && zip -qr lake-district-itinerary-site.zip lake-district-itinerary-site)
echo "built: $O, $SITE (+ .zip), and the PDF"
