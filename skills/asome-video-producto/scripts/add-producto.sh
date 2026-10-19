#!/bin/bash
# Adds the product-reel scaffold (assets/template-producto) to a project created by asome-video:
# src/producto/ (shell, timeline, theme, devices, scene stubs, cover, QA sheet), the voice/music/
# QA/render scripts, and <ProductoCompositions /> in src/Root.tsx. Then generates a first beat.
#   bash add-producto.sh ~/Documents/asome-videos/20261020_caso-plataforma-pedidos
# Exit codes: 0 ready (or already there), 2 not an asome-video project.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
dest="${1:?Uso: add-producto.sh <carpeta del proyecto de asome-video>}"
cd "$dest"

if ! grep -q '"name": "asome-video"' package.json 2>/dev/null || [ ! -f src/brand.tsx ]; then
  echo "En $dest no hay un proyecto de asome-video: crealo primero con su new-project.sh." >&2
  exit 2
fi
if [ -d src/producto ]; then
  echo "El proyecto ya tiene src/producto: se deja como está."
  exit 0
fi

cp -R "$here/../assets/template-producto/." .
chmod +x scripts/*.sh
mkdir -p public/producto/fonts out

node -e '
const fs = require("fs");
const f = "src/Root.tsx";
let s = fs.readFileSync(f, "utf8");
if (!s.includes("ProductoCompositions")) {
  const i = s.lastIndexOf("</>");
  if (i === -1) throw new Error("src/Root.tsx: no encuentro el cierre </> del RemotionRoot");
  s = `import { ProductoCompositions } from "./producto/Compositions";\n` + s.slice(0, i) + "  <ProductoCompositions />\n    " + s.slice(i);
  fs.writeFileSync(f, s);
}'

# Client assets, the voice and QA frames stay on this machine.
for line in "public/producto" "public/qa"; do
  grep -qxF "$line" .gitignore 2>/dev/null || echo "$line" >> .gitignore
done

node scripts/make-beat.mjs >/dev/null
echo "Listo: src/producto y scripts del reel de producto en $dest"
