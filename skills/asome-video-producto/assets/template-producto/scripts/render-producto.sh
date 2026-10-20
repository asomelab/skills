#!/bin/bash
# Exports the product reel in src/<tema>/ and gathers every deliverable, named per the ASOME rule
# (AAAAMMDD_formato_tema_vNN), into ~/Downloads/<AAAAMMDD>_<tema>/:
#   reel          1080x1920 H.264 + AAC, the file to upload (composition <tema>)
#   portada-reel  9:16 JPG cover (<tema>-portada), uploaded with the reel
#   subtitulos    out/<tema>/voz.srt     voz    public/<tema>/voz.*
#   guion         docs/<tema>/guion.txt  copy   docs/<tema>/<AAAAMMDD>_copy_<tema>.md (if it exists)
#   bash scripts/render-producto.sh caso-plataforma-pedidos      (default: the reel in .reel)
# Inside Claude Code run it with the Bash sandbox disabled (Chrome needs it).
set -euo pipefail
cd "$(dirname "$0")/.."

slug="${1:-${REEL:-$(cat .reel 2>/dev/null || true)}}"
if [[ ! "$slug" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "Uso: bash scripts/render-producto.sh <tema-en-minusculas-con-guiones>  (sin tildes ni espacios)" >&2
  exit 1
fi
if [ ! -f "src/$slug/Compositions.tsx" ]; then
  echo "No existe src/$slug: el tema tiene que ser la carpeta del reel." >&2
  exit 1
fi
export REEL="$slug"
date=$(date +%Y%m%d)
mkdir -p out

v=1
while ls out/"${date}"_*_"${slug}"_v"$(printf %02d $v)".* >/dev/null 2>&1; do v=$((v + 1)); done
ver="v$(printf %02d $v)"

browser=()
conc=1
while IFS= read -r line; do
  case "$line" in --concurrency=*) conc="${line#--concurrency=}" ;; *) browser+=("$line") ;; esac
done < <(bash scripts/browser.sh)
video=(--codec=h264 --x264-preset=slow --pixel-format=yuv420p --color-space=bt709
  --audio-codec=aac --audio-bitrate=320k --jpeg-quality=95 ${browser[@]+"${browser[@]}"})

# Opening 4 pages at once often fails ("Visited .../index.html but got no response"): retry once with 2.
render() {
  npx remotion render "$slug" "$@" "${video[@]}" "--concurrency=$conc" ||
    npx remotion render "$slug" "$@" "${video[@]}" "--concurrency=$((conc > 1 ? 2 : 1))"
}
render "out/${date}_reel_${slug}_${ver}.mp4" --crf=17
bash scripts/still.sh "$slug-portada" "out/${date}_portada-reel_${slug}_${ver}.jpg" --image-format=jpeg --jpeg-quality=90

dest="$HOME/Downloads/${date}_${slug}"
mkdir -p "$dest"
cp out/"${date}"_*_"${slug}"_"${ver}".* "$dest"/
[ -f "out/$slug/voz.srt" ] && cp "out/$slug/voz.srt" "$dest/${date}_subtitulos_${slug}_${ver}.srt"
for f in public/"$slug"/voz.*; do [ -f "$f" ] && cp "$f" "$dest/${date}_voz_${slug}_${ver}.${f##*.}"; done
[ -f "docs/$slug/guion.txt" ] && cp "docs/$slug/guion.txt" "$dest/${date}_guion_${slug}_${ver}.txt"
for f in docs/"$slug"/*_copy_"$slug".md; do [ -f "$f" ] && cp "$f" "$dest/"; done
echo "Listo: $dest"
ls -1 "$dest"
