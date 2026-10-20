#!/bin/bash
# Exports what Instagram needs, named per the ASOME rule (AAAAMMDD_formato_tema_vNN):
#   reel          1080x1920 H.264, the file to upload
#   reel-4k       2160x3840 master (graphics rendered at 2x)
#   portada-reel  9:16 JPG cover, uploaded with the reel
#   portada-feed  4:5 JPG, how the cover reads in the profile grid
#   subtitulos    SRT of the captions (src/<tema>/speech.ts)
# and copies them to ~/Downloads/<AAAAMMDD>_<tema>/. Compositions: <tema>, <tema>-portada,
# <tema>-portada-feed (src/<tema>/Compositions.tsx).
#   npm run render -- crecer-sin-estructura      (default: the reel in .reel)
set -euo pipefail
cd "$(dirname "$0")/.."

slug="${1:-${REEL:-$(cat .reel 2>/dev/null || true)}}"
if [[ ! "$slug" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "Usage: npm run render -- <tema-en-minusculas-con-guiones>  (sin tildes ni espacios)" >&2
  exit 1
fi
if [ ! -f "src/$slug/Compositions.tsx" ]; then
  echo "No existe src/$slug: el tema tiene que ser la carpeta del reel." >&2
  exit 1
fi
export REEL="$slug"
date=$(date +%Y%m%d)
mkdir -p out

# Next free version for today's slug: v01, v02, ...
v=1
while ls out/"${date}"_*_"${slug}"_v"$(printf %02d $v)".* >/dev/null 2>&1; do v=$((v + 1)); done
ver="v$(printf %02d $v)"

browser=()
conc=4
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [[ -x "$chrome" ]]; then
  # The system Chrome renders fine from Claude's shell (sandbox off) and in parallel.
  browser=("--browser-executable=$chrome")
elif [[ "$(uname)" == "Darwin" ]]; then
  # Fallback: Remotion's Chrome as one process (see chrome-single.sh). Slower, but works
  # inside the Claude app, where its multi-process mode dies with "Target closed".
  npx remotion browser ensure >/dev/null
  browser=("--browser-executable=$PWD/scripts/chrome-single.sh")
  conc=1
fi
video=(--codec=h264 --x264-preset=slow --pixel-format=yuv420p --color-space=bt709
  --audio-codec=aac --audio-bitrate=320k --jpeg-quality=95 ${browser[@]+"${browser[@]}"})
still=(--image-format=jpeg --jpeg-quality=90 ${browser[@]+"${browser[@]}"})

# Opening 4 pages at once sometimes fails ("Visited .../index.html but got no response"):
# retry once with 2.
render() {
  npx remotion render "$slug" "$@" "${video[@]}" "--concurrency=$conc" ||
    npx remotion render "$slug" "$@" "${video[@]}" "--concurrency=$((conc > 1 ? 2 : 1))"
}
render "out/${date}_reel_${slug}_${ver}.mp4" --crf=17
render "out/${date}_reel-4k_${slug}_${ver}.mp4" --scale=2 --crf=16
npx remotion still "$slug-portada" "out/${date}_portada-reel_${slug}_${ver}.jpg" "${still[@]}"
npx remotion still "$slug-portada-feed" "out/${date}_portada-feed_${slug}_${ver}.jpg" "${still[@]}"
npx tsx scripts/srt.mts "out/${date}_subtitulos_${slug}_${ver}.srt"

dest="$HOME/Downloads/${date}_${slug}"
mkdir -p "$dest"
cp out/"${date}"_*_"${slug}"_"${ver}".* "$dest"/
echo "Listo: $dest"
ls -1 "$dest"
