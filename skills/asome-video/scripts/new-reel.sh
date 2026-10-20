#!/bin/bash
# Gets the ASOME reels repo ready on this machine and adds one reel folder to it.
#   bash scripts/new-reel.sh <tema> [<skeleton>]
#     <tema>      lowercase, no accents, words joined by hyphens: the reel's folder and id prefix
#     <skeleton>  folder copied to src/<tema>/ (default: assets/reel, a talking-head reel;
#                 asome-video-producto passes its own)
#
# 1. Repo: $ASOME_VIDEOS_DIR or ~/Documents/asome-videos/videos. An existing clone is reused
#    (git pull --ff-only when clean). Otherwise, with `gh` signed in and access to the private
#    asomelab/videos, it is cloned: Maax comes versioned in it. Without access (fallback): a local
#    repo from assets/template with `git init`, Maax copied from the ASOME Drive and gitignored.
# 2. Base: copies template files the repo lacks (never overwrites; prints DIFIERE <file> for a
#    shared file that differs), adds missing package.json dependencies and scripts, the
#    .gitignore lines (raws, pre-cuts, generated audio, .env), and runs npm install if needed.
# 3. Reel: src/<tema>/ from the skeleton with __TEMA__ replaced, public/<tema>/ for its media,
#    <Compositions /> registered in src/Root.tsx, .reel = <tema> (the reel the npm scripts use),
#    the sound kit and the render browser.
# Commits nothing: the agent commits at the milestones (SKILL.md, "Git").
# Exit codes: 0 ready, 1 usage, 2 the repo folder holds something else, 3 ready but Maax missing.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
template="$here/../assets/template"
tema="${1:-}"
skeleton="${2:-$here/../assets/reel}"
if [[ ! "$tema" =~ ^[a-z][a-z0-9]*(-[a-z0-9]+)*$ ]]; then
  echo "Uso: new-reel.sh <tema-en-minusculas-con-guiones> [<esqueleto>]  (sin tildes ni espacios)" >&2
  exit 1
fi
ws="${ASOME_VIDEOS_DIR:-$HOME/Documents/asome-videos/videos}"

# 1. Repo
local_repo=0
if [ -d "$ws/.git" ]; then
  echo "Repo de videos: $ws (se reutiliza)"
  if [ -z "$(git -C "$ws" status --porcelain)" ] && git -C "$ws" remote get-url origin >/dev/null 2>&1; then
    git -C "$ws" pull --ff-only --quiet || echo "AVISO  no pude actualizar desde GitHub (git pull): sigo con lo que hay." >&2
  fi
elif [ -e "$ws" ] && [ -n "$(ls -A "$ws" 2>/dev/null)" ]; then
  echo "La carpeta $ws ya tiene otros archivos y no es un repo de git: elegí otra con ASOME_VIDEOS_DIR." >&2
  exit 2
elif command -v gh >/dev/null 2>&1 && gh repo view asomelab/videos --json name >/dev/null 2>&1; then
  echo "Bajando el repo privado asomelab/videos a $ws..."
  mkdir -p "$(dirname "$ws")"
  gh repo clone asomelab/videos "$ws" -- --quiet
else
  echo "AVISO  sin acceso a asomelab/videos: armo un repo local en $ws (sin GitHub)." >&2
  mkdir -p "$ws"
  cp -R "$template/." "$ws/"
  # The template's .gitignore keeps Maax out of a local repo: it is licensed to ASOME and a
  # local repo could be pushed anywhere. Only asomelab/videos (private) versions it.
  git -C "$ws" init -q -b main
  local_repo=1
fi
cd "$ws"

# 2. Base
while IFS= read -r rel; do
  case "$rel" in package.json | .gitignore | src/Root.tsx | public/fonts/*) continue ;; esac
  if [ ! -e "$rel" ]; then
    mkdir -p "$(dirname "$rel")"
    cp "$template/$rel" "$rel"
  elif ! cmp -s "$template/$rel" "$rel"; then
    case "$rel" in src/* | scripts/*) echo "DIFIERE $rel" ;; esac
  fi
done < <(cd "$template" && find . -type f ! -name .DS_Store | sed 's#^\./##' | sort)
chmod +x scripts/*.sh

[ -f package.json ] || cp "$template/package.json" package.json
before=$(cksum < package.json)
node -e '
const fs = require("fs");
const [tpl, cur] = [process.argv[1], "package.json"].map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
const added = [];
for (const k of ["dependencies", "devDependencies", "scripts"]) {
  cur[k] ??= {};
  for (const [n, v] of Object.entries(tpl[k] ?? {})) if (!(n in cur[k])) { cur[k][n] = v; added.push(n); }
}
if (added.length) {
  fs.writeFileSync("package.json", JSON.stringify(cur, null, 2) + "\n");
  console.log("package.json: agregado " + added.join(", "));
}' "$template/package.json"

touch .gitignore
for line in node_modules out .DS_Store .env ".env.*" .reel transcript.json \
  "public/**/*.mp4" "public/**/*.mov" "public/**/*.wav" public/qa; do
  grep -qxF -- "$line" .gitignore || echo "$line" >> .gitignore
done

if [ ! -d node_modules ] || [ "$before" != "$(cksum < package.json)" ]; then
  echo "Instalando dependencias (puede tardar unos minutos la primera vez)..."
  npm install --no-audit --no-fund --loglevel=error
fi

fonts=1
if [ ! -f public/fonts/Maax-Bold.ttf ]; then
  fonts=0
  if maax=$(bash "$here/find-maax.sh"); then
    mkdir -p public/fonts
    cp "$maax/Maax-Bold.ttf" public/fonts/Maax-Bold.ttf
    cp "$maax/Maax-Medium.ttf" public/fonts/Maax-Medium.ttf
    # The regular weight ships as "Maax.ttf" in the brand folder.
    cp "$maax/Maax.ttf" public/fonts/Maax-Regular.ttf 2>/dev/null || cp "$maax/Maax-Regular.ttf" public/fonts/Maax-Regular.ttf
    fonts=1
    [ "$local_repo" -eq 1 ] || echo "AVISO  Maax no estaba en el repo: la copié del Drive. Commitearla solo en asomelab/videos (privado)." >&2
  fi
fi

# 3. Reel
if [ -d "src/$tema" ]; then
  echo "El reel src/$tema ya existe: se sigue trabajando en él."
else
  mkdir -p "src/$tema"
  cp -R "$skeleton/." "src/$tema/"
  find "src/$tema" -type f -exec perl -pi -e "s/__TEMA__/$tema/g" {} +
fi
mkdir -p "public/$tema"
TEMA="$tema" node -e '
const fs = require("fs");
const tema = process.env.TEMA;
const f = "src/Root.tsx";
let s = fs.readFileSync(f, "utf8");
const from = `./${tema}/Compositions`;
if (!s.includes(`"${from}"`)) {
  const id = "R_" + tema.replace(/-/g, "_");
  const i = s.lastIndexOf("</>");
  if (i === -1) throw new Error("src/Root.tsx: no encuentro el cierre </> del RemotionRoot");
  s = s.slice(0, i) + `  <${id} />\n    ` + s.slice(i);
  const imports = [...s.matchAll(/^import .*;$/gm)];
  const at = imports.length ? imports[imports.length - 1].index + imports[imports.length - 1][0].length + 1 : 0;
  s = s.slice(0, at) + `import { Compositions as ${id} } from "${from}";\n` + s.slice(at);
  fs.writeFileSync(f, s);
}'
echo "$tema" > .reel

npm run --silent audio >/dev/null
npx remotion browser ensure >/dev/null

echo "Listo: reel src/$tema en $ws"
if [ "$fonts" -eq 0 ]; then
  echo "FALTA la tipografía Maax: copiala a $ws/public/fonts (Maax-Bold.ttf, Maax-Medium.ttf, Maax-Regular.ttf)." >&2
  exit 3
fi
