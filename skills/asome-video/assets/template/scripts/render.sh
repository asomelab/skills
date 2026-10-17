#!/bin/bash
# Exports what Instagram needs, named per the ASOME rule (AAAAMMDD_formato_tema_vNN):
#   reel          1080x1920 H.264, the file to upload
#   reel-4k       2160x3840 master (graphics rendered at 2x)
#   portada-reel  9:16 JPG cover, uploaded with the reel
#   portada-feed  4:5 JPG, how the cover reads in the profile grid
# and copies them to ~/Downloads/<AAAAMMDD>_<tema>/.
#   npm run render -- crecer-sin-estructura
set -euo pipefail
cd "$(dirname "$0")/.."

slug="${1:-}"
if [[ ! "$slug" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "Usage: npm run render -- <tema-en-minusculas-con-guiones>  (sin tildes ni espacios)" >&2
  exit 1
fi
date=$(date +%Y%m%d)
mkdir -p out

# Next free version for today's slug: v01, v02, ...
v=1
while ls out/"${date}"_*_"${slug}"_v"$(printf %02d $v)".* >/dev/null 2>&1; do v=$((v + 1)); done
ver="v$(printf %02d $v)"

npx remotion browser ensure >/dev/null
browser=()
if [[ "$(uname)" == "Darwin" ]]; then
  # Single-process Chrome renders on any Mac, including inside the Claude app (see chrome-single.sh).
  browser=(--concurrency=1 "--browser-executable=$PWD/scripts/chrome-single.sh")
fi
video=(--codec=h264 --x264-preset=slow --pixel-format=yuv420p --color-space=bt709
  --audio-codec=aac --audio-bitrate=320k --jpeg-quality=95 ${browser[@]+"${browser[@]}"})
still=(--image-format=jpeg --jpeg-quality=90 ${browser[@]+"${browser[@]}"})

npx remotion render Reel "out/${date}_reel_${slug}_${ver}.mp4" --crf=17 "${video[@]}"
npx remotion render Reel "out/${date}_reel-4k_${slug}_${ver}.mp4" --scale=2 --crf=16 "${video[@]}"
npx remotion still ReelCover "out/${date}_portada-reel_${slug}_${ver}.jpg" "${still[@]}"
npx remotion still ReelCoverFeed "out/${date}_portada-feed_${slug}_${ver}.jpg" "${still[@]}"

dest="$HOME/Downloads/${date}_${slug}"
mkdir -p "$dest"
cp out/"${date}"_*_"${slug}"_"${ver}".* "$dest"/
echo "Listo: $dest"
ls -1 "$dest"
