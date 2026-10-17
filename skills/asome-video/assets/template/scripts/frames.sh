#!/bin/bash
# Saves stills of the raw footage at the given seconds, to look at framing, gestures and cut points.
#   npm run frames -- 6.0 9.4 13.1          (from public/clip.mp4)
#   SRC=public/clip-2.mp4 npm run frames -- 3 8
set -euo pipefail
cd "$(dirname "$0")/.."
src="${SRC:-public/clip.mp4}"
mkdir -p out/frames
for t in "$@"; do
  npx remotion ffmpeg -v error -ss "$t" -i "$src" -frames:v 1 -vf scale=540:-2 -y "out/frames/t$t.jpg"
done
ls -1 out/frames
