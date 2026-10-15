#!/bin/bash
# Creates a ready-to-edit reel project from assets/template:
# copies the template, brings Maax from the ASOME Drive, installs dependencies,
# synthesizes the sound kit and downloads the render browser.
#   bash scripts/new-project.sh ~/Documents/asome-videos/20261015_crecer-sin-estructura
# Exit codes: 0 ready, 2 destination already used by something else, 3 ready but Maax missing.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
dest="${1:?Usage: new-project.sh <project folder>}"

if [ -d "$dest" ] && [ -n "$(ls -A "$dest" 2>/dev/null)" ]; then
  if grep -q '"name": "asome-video"' "$dest/package.json" 2>/dev/null; then
    echo "Ya existe un proyecto de video en $dest: se reutiliza."
  else
    echo "La carpeta $dest ya tiene otros archivos: elegí otra." >&2
    exit 2
  fi
else
  mkdir -p "$dest"
  cp -R "$here/../assets/template/." "$dest/"
  chmod +x "$dest"/scripts/*.sh
fi
cd "$dest"

fonts=0
if maax=$(bash "$here/find-maax.sh"); then
  cp "$maax/Maax-Bold.ttf" public/fonts/Maax-Bold.ttf
  cp "$maax/Maax-Medium.ttf" public/fonts/Maax-Medium.ttf
  # The regular weight ships as "Maax.ttf" in the brand folder.
  cp "$maax/Maax.ttf" public/fonts/Maax-Regular.ttf 2>/dev/null || cp "$maax/Maax-Regular.ttf" public/fonts/Maax-Regular.ttf
  fonts=1
fi

echo "Instalando dependencias (puede tardar unos minutos la primera vez)..."
npm install --no-audit --no-fund --loglevel=error
npm run --silent audio
npx remotion browser ensure >/dev/null

echo "Proyecto listo en $dest"
if [ "$fonts" -eq 0 ]; then
  echo "FALTA la tipografía Maax: copiala a $dest/public/fonts (Maax-Bold.ttf, Maax-Medium.ttf, Maax-Regular.ttf)." >&2
  exit 3
fi
