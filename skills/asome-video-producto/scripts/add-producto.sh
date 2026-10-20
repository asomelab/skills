#!/bin/bash
# Creates a product reel in the ASOME videos repo: runs asome-video's new-reel.sh with this
# skill's skeleton (assets/template-producto/reel -> src/<tema>/: shell, timeline, theme, devices,
# scene stubs, cover, QA sheet, compositions <tema>, <tema>-<scene>, <tema>-portada, <tema>-qa),
# copies the voice/music/QA/render scripts the repo lacks into scripts/, creates
# public/<tema>/fonts and docs/<tema>/, and generates a first beat.
#   bash add-producto.sh caso-plataforma-pedidos
# Exit codes: those of new-reel.sh (0 ready, 1 usage, 2 repo folder busy, 3 Maax missing),
# 4 asome-video is not installed next to this skill.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
tema="${1:?Uso: add-producto.sh <tema-en-minusculas-con-guiones>}"
video_skill="$here/../../asome-video"
if [ ! -f "$video_skill/scripts/new-reel.sh" ]; then
  echo "Falta la skill asome-video (instalala primero: npx skills add asomelab/skills)." >&2
  exit 4
fi

status=0
bash "$video_skill/scripts/new-reel.sh" "$tema" "$here/../assets/template-producto/reel" || status=$?
[ "$status" -eq 0 ] || [ "$status" -eq 3 ] || exit "$status"

cd "${ASOME_VIDEOS_DIR:-$HOME/Documents/asome-videos/videos}"
for f in "$here/../assets/template-producto/scripts/"*; do
  name=$(basename "$f")
  if [ ! -e "scripts/$name" ]; then
    cp "$f" "scripts/$name"
  elif ! cmp -s "$f" "scripts/$name"; then
    echo "DIFIERE scripts/$name"
  fi
done
chmod +x scripts/*.sh
mkdir -p "public/$tema/fonts" "docs/$tema" out

node scripts/make-beat.mjs >/dev/null
echo "Listo: reel de producto src/$tema (docs/$tema para guion, brief y copy)"
exit "$status"
