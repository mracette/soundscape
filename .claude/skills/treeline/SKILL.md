---
name: treeline
description: Regenerate the landing page forest treeline silhouette (SVG asset rendered by LandingPageTreeline). Use when asked to redo, reseason, or restyle the landing page trees.
---

The landing page treeline is one vector silhouette (`src/viz/img/landing/treeline.svg`) that `LandingPageTreeline` rasterizes per-viewport and renders as layered depth planes. Regenerating it is a three-step pipeline: generate a bitmap, vectorize it, update the band constants.

## 1. Generate candidates

Use the nano-banana MCP `generate_image` tool. **Always `model: "pro"`** (the default flash model produces low-quality silhouettes), `aspect_ratio: "21:9"`, `n: 3`.

Base prompt (adjust the style clause — e.g. season, tree mix — to the request, keep everything else):

> A horizontal strip of a forest treeline silhouette, pure solid black trees on a pure white background, no gray, no gradients, high contrast binary image suitable for vectorization. Lush midsummer forest in full leaf: mostly tall slender spruce and fir tips of varying heights, mixed with a few full-crowned leafy deciduous trees (rounded, dense foliage — absolutely no bare or leafless branches), natural uneven rhythm, some gaps between clusters. The silhouette occupies only the bottom third of the frame; the upper two thirds are pure white. Side edges at similar tree height so the strip could tile horizontally. Elegant, moody, natural — not cartoonish, not a repeating pattern.

Pick the candidate with strong height variation (tall spires + dips) and a clean white sky; show the user the candidates before proceeding. The composition mirror-tiles at runtime, so left/right edges should end at similar tree height.

## 2. Vectorize

Preserve the current asset first if it's worth keeping (`treeline-winter.svg` etc. — dead variants are fine to delete later):

```
cp src/viz/img/landing/treeline.svg src/viz/img/landing/treeline-<old-variant>.svg
scripts/vectorize-treeline.sh <candidate>.png
```

The script (imagemagick + potrace, both via brew) thresholds, traces, writes the SVG, and prints the measured constants.

## 3. Update constants

Paste the printed `SVG_WIDTH` / `SVG_HEIGHT` / `BAND_TOP` / `BAND_HEIGHT` values into `src/viz/subjects/LandingPageTreeline.ts`. They describe which rows of the source the trees occupy and MUST match the new asset or the layers mis-anchor.

Sanity check — the band's bottom row must be solid black (the tint skirt fills below it; a non-solid bottom row shows a background gap at the viewport bottom):

```
magick <candidate>.png -colorspace gray -threshold 50% -crop <W>x1+0+<H-1> -format "%[fx:mean]" info:
```

Must print `0`. If not, lower BAND_HEIGHT until the corresponding row is solid.

## 4. Verify

Load the landing page (dev server: `npm start`) at desktop and ~390px-wide viewports. Check: no horizontal seams, no gap under the trees, layers overlap without a bare "ground" band, silhouette crisp.
