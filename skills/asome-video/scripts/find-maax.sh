#!/bin/bash
# Prints the folder that holds ASOME's licensed title font (Maax Bold, Medium and Regular),
# or nothing. Looks where an ASOME teammate usually has it: the Google Drive app, Downloads,
# Desktop, Documents, Fonts. Prefers the official ASOME/brand folder over any other copy.
candidates=$(
  for root in "$HOME/Library/CloudStorage" "$HOME/Downloads" "$HOME/Desktop" "$HOME/Documents" "$HOME/Library/Fonts" "/Library/Fonts"; do
    [ -d "$root" ] && find "$root" -maxdepth 8 -type f -name "Maax-Bold.ttf" 2>/dev/null
  done | sed 's#/Maax-Bold.ttf$##'
)
complete() { [ -f "$1/Maax-Medium.ttf" ] && { [ -f "$1/Maax.ttf" ] || [ -f "$1/Maax-Regular.ttf" ]; }; }

best=""
while IFS= read -r dir; do
  [ -n "$dir" ] && complete "$dir" || continue
  case "$dir" in
    */ASOME/brand/*) echo "$dir"; exit 0 ;;
  esac
  [ -z "$best" ] && best="$dir"
done <<< "$candidates"

[ -n "$best" ] && echo "$best" && exit 0
exit 1
