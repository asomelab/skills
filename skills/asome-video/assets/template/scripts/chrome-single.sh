#!/bin/sh
# Remotion's headless Chrome in single-process mode. Inside the Claude desktop app (and its
# terminal tabs) macOS denies Chrome's helper processes a Mach-port lookup, which surfaces as
# "Target closed". One process means no helpers. Always pair it with --concurrency=1.
# Fallback only: when Google Chrome is installed, render.sh uses it instead (faster).
dir=$(cd "$(dirname "$0")/.." && pwd)
bin=$(find "$dir/node_modules/.remotion/chrome-headless-shell" -type f -name chrome-headless-shell 2>/dev/null | head -n 1)
if [ -z "$bin" ]; then
  echo "chrome-headless-shell not found: run 'npx remotion browser ensure' first" >&2
  exit 1
fi
exec "$bin" --single-process --no-zygote --in-process-gpu \
  --enable-features=NetworkServiceInProcess2 \
  --disable-features=AudioServiceOutOfProcess "$@"
