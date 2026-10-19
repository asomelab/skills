#!/bin/bash
# One Remotion still with this machine's browser flags (scripts/browser.sh), retried once: a cold
# start sometimes gets "Visited .../index.html but got no response". Paths are relative to the
# project root (or absolute); extra arguments go straight to `remotion still`.
#   bash scripts/still.sh P-sideA out/check/f30.png --frame=30 --scale=0.5
# Inside Claude Code run it with the Bash sandbox disabled (Chrome needs it).
set -euo pipefail
cd "$(dirname "$0")/.."
comp="${1:?Uso: bash scripts/still.sh <composición> <salida.png|jpg> [--frame=N --scale=0.5 …]}"
out="${2:?Uso: bash scripts/still.sh <composición> <salida.png|jpg> [--frame=N --scale=0.5 …]}"
shift 2
browser=()
while IFS= read -r line; do browser+=("$line"); done < <(bash scripts/browser.sh)
mkdir -p "$(dirname "$out")"
npx remotion still "$comp" "$out" --log=error "$@" ${browser[@]+"${browser[@]}"} ||
  npx remotion still "$comp" "$out" --log=error "$@" ${browser[@]+"${browser[@]}"}
