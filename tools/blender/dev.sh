#!/usr/bin/env bash
# Launch Blender for Soundscape addon dev: sets SOUNDSCAPE_NODE_BIN + inherits your
# shell PATH so the bake ("Bake All Bands") can spawn node, and backgrounds Blender
# so your terminal stays free (bake/CLI logs still print here).
#
# Requires the addon to be installed + enabled once (see ./dev-install.sh).
# Usage:  ./tools/blender/dev.sh
set -euo pipefail

BLENDER="${BLENDER_BIN:-/Applications/Blender.app/Contents/MacOS/Blender}"
NODE_BIN="${SOUNDSCAPE_NODE_BIN:-$(command -v node || true)}"

if [ -z "$NODE_BIN" ]; then
  echo "node not found on PATH (set SOUNDSCAPE_NODE_BIN=/path/to/node)" >&2
  exit 1
fi

SOUNDSCAPE_NODE_BIN="$NODE_BIN" "$BLENDER" "$@" &
echo "Launched Blender (node: $NODE_BIN)."
