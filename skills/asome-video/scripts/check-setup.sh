#!/bin/bash
# Diagnoses the machine for asome-video. Read-only: installs nothing.
# Prints one line per requirement (OK / FALTA / AVISO) and exits 1 if something required is missing.
#   bash scripts/check-setup.sh
here=$(cd "$(dirname "$0")" && pwd)
missing=0
ok() { echo "OK     $1"; }
bad() { echo "FALTA  $1"; missing=1; }
warn() { echo "AVISO  $1"; }

os=$(uname -s)
arch=$(uname -m)
if [ "$os" = "Darwin" ]; then
  ok "Sistema: macOS $(sw_vers -productVersion 2>/dev/null) ($arch)"
else
  warn "Sistema: $os ($arch). La skill está probada en macOS; en otros sistemas puede necesitar ajustes."
fi

if command -v node >/dev/null 2>&1; then
  major=$(node -p "process.versions.node.split('.')[0]")
  if [ "$major" -ge 18 ]; then
    ok "Node.js $(node -v)"
  else
    bad "Node.js $(node -v) es muy viejo: hace falta la versión 18 o más nueva"
  fi
else
  bad "Node.js (el programa que ejecuta Remotion)"
fi
command -v npx >/dev/null 2>&1 && ok "npx" || bad "npx (viene con Node.js)"

if command -v brew >/dev/null 2>&1; then
  ok "Homebrew (para instalar Node.js si falta)"
else
  warn "Homebrew no está: si falta Node.js se instala con nvm, sin pedir contraseña"
fi

free_kb=$(df -Pk "$HOME" | awk 'NR==2 {print $4}')
if [ "${free_kb:-0}" -ge 3000000 ]; then
  ok "Espacio libre: $((free_kb / 1048576)) GB"
else
  bad "Espacio libre: hacen falta 3 GB (hay $((free_kb / 1048576)) GB)"
fi

if curl -sI --max-time 8 https://registry.npmjs.org >/dev/null 2>&1; then
  ok "Internet"
else
  bad "Internet (para descargar Remotion, la tipografía Inter y el modelo de transcripción)"
fi

if maax=$(bash "$here/find-maax.sh"); then
  ok "Tipografía Maax: $maax"
else
  bad "Tipografía Maax (está en el Drive de ASOME: brand > Tipografia > Maax)"
fi

if [ -d "$HOME/.claude/skills/remotion-best-practices" ] || [ -d "$HOME/.agents/skills/remotion-best-practices" ]; then
  ok "Skill remotion-best-practices"
else
  bad "Skill remotion-best-practices (conocimiento de Remotion para el agente)"
fi

if [ "$os" = "Darwin" ] && [ "$arch" != "arm64" ]; then
  warn "Mac con procesador Intel: la transcripción por GPU puede no funcionar"
fi

exit $missing
