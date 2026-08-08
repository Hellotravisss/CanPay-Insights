#!/bin/bash
# Social platforms reject SVG for og:image, so every cover also ships as PNG.
# macOS QuickLook renders SVG with real font support (ImageMagick cannot);
# it only makes square thumbnails, hence the square wrapper + exact crop.
set -e
cd "$(dirname "$0")/.."
mkdir -p /tmp/cov_out
for svg in public/blog/*-take-home-pay-guide-2026.svg; do
  base=$(basename "$svg" .svg)
  python3 - "$svg" <<'PY'
import sys
src = open(sys.argv[1]).read()
inner = src.split('>', 1)[1].rsplit('</svg>', 1)[0]
open('/tmp/cov_square.svg', 'w').write(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200">'
  '<rect width="1200" height="1200" fill="#0f172a"/>'
  f'<g transform="translate(0,285)">{inner}</g></svg>'
)
PY
  rm -f /tmp/cov_out/*
  qlmanage -t -s 1200 -o /tmp/cov_out /tmp/cov_square.svg >/dev/null 2>&1
  magick /tmp/cov_out/cov_square.svg.png -crop 1200x630+0+285 +repage "public/blog/${base}.png"
done
echo "rasterized: $(ls public/blog/*-take-home-pay-guide-2026.png | wc -l)"
