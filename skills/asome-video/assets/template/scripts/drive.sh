#!/bin/bash
# Copies the delivery folder (~/Downloads/<AAAAMMDD>_<tema>) to the ASOME Drive, into
# ASOME/marketing/reels/<YYYY-MM-DD> <tema>/, through the Google Drive for desktop folder.
#   npm run drive -- crecer-sin-estructura            (today's export)
#   npm run drive -- crecer-sin-estructura 20261015   (another day's)
# Exit 1: Google Drive for desktop has no ASOME/marketing/reels here (upload by hand).
# Exit 2: nothing exported yet for that day and topic.
set -euo pipefail
slug="${1:?Usage: npm run drive -- <tema> [AAAAMMDD]}"
day="${2:-$(date +%Y%m%d)}"
src="$HOME/Downloads/${day}_${slug}"
if [ ! -d "$src" ]; then
  echo "No existe $src: exportá primero (npm run render -- $slug)." >&2
  exit 2
fi

# "My Drive/ASOME/..." or a shared drive called ASOME ("Shared drives/ASOME/...").
reels=""
for d in "$HOME"/Library/CloudStorage/GoogleDrive-*/*/ASOME/marketing/reels; do
  [ -d "$d" ] && reels="$d" && break
done
if [ -z "$reels" ]; then
  echo "No encuentro la carpeta ASOME/marketing/reels de Google Drive para escritorio en esta Mac." >&2
  exit 1
fi

dest="$reels/${day:0:4}-${day:4:2}-${day:6:2} $slug"
mkdir -p "$dest"
cp "$src"/* "$dest"/
echo "Subido a: $dest"
ls -1 "$dest"
