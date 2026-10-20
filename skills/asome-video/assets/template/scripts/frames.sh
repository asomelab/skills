#!/bin/bash
# Saves stills of the raw footage at the given seconds, to look at framing, gestures and cut points.
#   npm run frames -- 6.0 9.4 13.1          (from public/<tema>/clip.mp4, the reel in .reel)
#   SRC=public/<tema>/cut.mp4 npm run frames -- 3 8
set -euo pipefail
cd "$(dirname "$0")/.."
reel="${REEL:-$(cat .reel 2>/dev/null || true)}"
src="${SRC:-public/$reel/clip.mp4}"
mkdir -p out/frames
for t in "$@"; do
  npx remotion ffmpeg -v error -ss "$t" -i "$src" -frames:v 1 -vf scale=540:-2 -y "out/frames/t$t.jpg"
done
ls -1 out/frames
