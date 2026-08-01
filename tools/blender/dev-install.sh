#!/usr/bin/env bash
# One-time: symlink the Soundscape addon into Blender's user add-ons dir so it
# shows up in Preferences > Add-ons and auto-loads on every launch. Because it's a
# symlink to this repo, code edits are picked up by "Reload Scripts" (no reinstall).
#
# Usage:  ./tools/blender/dev-install.sh
# Undo:   rm "<printed link path>"
set -euo pipefail

BLENDER="${BLENDER_BIN:-/Applications/Blender.app/Contents/MacOS/Blender}"
ADDON_SRC="$(cd "$(dirname "$0")/addon" && pwd)"

if [ ! -x "$BLENDER" ]; then
  echo "Blender not found at $BLENDER (override with BLENDER_BIN=...)" >&2
  exit 1
fi

ADDONS_DIR="$("$BLENDER" --background --python-expr \
  "import bpy; print('SS_ADDONS='+bpy.utils.user_resource('SCRIPTS', path='addons', create=True))" \
  2>/dev/null | sed -n 's/^SS_ADDONS=//p' | tail -1)"

if [ -z "$ADDONS_DIR" ]; then
  echo "Could not determine Blender's add-ons dir." >&2
  exit 1
fi

LINK="$ADDONS_DIR/soundscape_bindings"
ln -sfn "$ADDON_SRC" "$LINK"

echo "Linked: $LINK -> $ADDON_SRC"
echo
echo "Next (one time): open Blender > Edit > Preferences > Add-ons, search"
echo "\"Soundscape\", and tick it. After that it auto-loads on every launch."
echo "On code changes: F3 > \"Reload Scripts\" (no restart)."
