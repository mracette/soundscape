#!/usr/bin/env bash
# Key out a flat background from an illustration layer via flood-fill.
# Usage: key-layer.sh in.png out.png x1,y1 [x2,y2 ...]
# Seed points must be on background pixels. Flood-fill (vs global
# -transparent) preserves enclosed background-colored fills inside the art.
set -euo pipefail

[ $# -ge 3 ] || { echo "usage: $0 in.png out.png x1,y1 [x2,y2 ...]" >&2; exit 1; }

in=$1; out=$2; shift 2
draws=()
for seed in "$@"; do
  draws+=(-draw "alpha ${seed%,*},${seed#*,} floodfill")
done

magick "$in" -alpha set -fuzz 9% -fill none "${draws[@]}" "$out"
echo "keyed: $out"
