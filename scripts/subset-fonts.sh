#!/usr/bin/env bash
# Regenerates src/assets/fonts from @fontsource/iosevka-aile, keeping only the characters
# the site uses. The full "latin" files are about 1.2MB per weight; these are about 86KB.
# Needs fonttools and brotli: pip install fonttools brotli
set -euo pipefail
cd "$(dirname "$0")/.."

# Basic Latin, Latin-1, a few extra Latin letters, spacing accents, general punctuation
# (dashes, quotes, ellipsis), euro, trademark, arrows (↗) and minus.
UNICODES="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2010-2027,U+2030-203A,U+20AC,U+2122,U+2190-2199,U+2212"

for weight in 300 400 500; do
  pyftsubset "node_modules/@fontsource/iosevka-aile/files/iosevka-aile-latin-$weight-normal.woff2" \
    --unicodes="$UNICODES" --layout-features='*' --flavor=woff2 \
    --output-file="src/assets/fonts/iosevka-aile-$weight.woff2"
done
