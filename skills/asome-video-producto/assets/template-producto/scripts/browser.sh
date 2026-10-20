#!/bin/bash
# Prints the Remotion browser flags for this machine, one per line (render and still accept both).
# System Chrome renders the product reel reliably from Claude's shell (Bash with the sandbox
# disabled); there the bundled chrome-headless-shell crashed with "GPU process isn't usable".
# Without system Chrome on a Mac: the single-process headless shell, one tab at a time.
cd "$(dirname "$0")/.."
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ -x "$chrome" ]; then
  echo "--browser-executable=$chrome"
  echo "--concurrency=4"
elif [ "$(uname)" = "Darwin" ]; then
  npx remotion browser ensure >/dev/null
  echo "--browser-executable=$PWD/scripts/chrome-single.sh"
  echo "--concurrency=1"
fi
