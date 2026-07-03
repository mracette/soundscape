---
description: Turn AI-generated illustrations into layered, animated SVGs (sway, glow, parallax). Use when the user wants rich illustrated artwork for a web page that also needs subtle animation — e.g. plants swaying, elements glowing — beyond what hand-authored SVG paths can achieve.
---

Pipeline: generate each animatable element as a separate image with the nano-banana MCP tools, key out backgrounds with ImageMagick, then mount the layers in an SVG animation rig. Hand-authoring detailed vector illustration caps out at "decent"; this keeps full illustration quality while every layer stays independently animatable.

## 1. Iterate on the design first

- Use `mcp__nano-banana__generate_image` / `edit_image` with `model: "pro"` — the default fast model corrupts embedded text and icons.
- Iterate on full-composition concepts with the user until the direction is locked. Only then split into layers.
- Reference images anchor composition strongly: if the user wants a different shape/layout, drop `reference_image_paths` and describe the style in words instead.
- macOS screenshot filenames contain a narrow no-break space (U+202F) before "AM"/"PM" — resolve paths with `find ... -iname` and copy to a plain-ASCII path before passing to MCP tools.

## 2. Generate one image per animated layer

For each element that moves independently, generate a separate full-frame image (all layers same aspect ratio so they stack without placement math):

- Solid flat background in the target page's color ("no stars, no texture, no gradient, no vignette — one flat color everywhere"). Same-color background makes keying halos invisible on the real page.
- Describe anchor and growth direction ("rooted at the bottom edge slightly left of center...") and name the regions that must stay empty.
- For organic subjects, ask for visible growth logic ("stem thicker near root, thinner toward tip — clearly one continuous growing plant") to avoid decorative-border look.

## 3. Key out the background

`scripts/key-layer.sh in.png out.png x1,y1 [x2,y2 ...]` — flood-fills transparency from known-background seed points (fuzz 9%), leaving enclosed fills inside the artwork untouched. Seed multiple edge points in case the artwork splits the background into disconnected regions. Verify with a composite:

```
magick -size WxH xc:'#PAGEBG' layer1.png -composite layer2.png -composite check.png
```

Read check.png before proceeding.

## 4. Assemble the animated SVG

Adapt `references/rig-template.svg`: one `<g>` per layer with `animateTransform` sway (rotate ±0.5–0.7°, pivot at the element's visual root, different `dur` per layer so motion never syncs), plus radial-gradient glow circles with staggered opacity pulses at points of interest (read the layer image to eyeball coordinates). Base64-embed layers via shell concatenation — never read base64 into context:

```
{ tr -d '\n' < head.part; base64 -i layer1.png; tr -d '\n' < mid.part; base64 -i layer2.png; cat tail.part; } > out.svg
xmllint --noout out.svg
```

## 5. Preview and iterate

`qlmanage -t -s 1600 -o . out.svg` renders a static frame — Read it to check composition (qlmanage renders overflow past the viewBox; browsers clip it). Animation itself only shows in a browser. When claiming a file was delivered somewhere, run the copy command and verify.

## Production notes

- Mark preview-only blocks (background rect, placeholder text/UI) with comments so they're easy to strip; the real page supplies text and controls as HTML/CSS on top.
- Convert embedded layers to WebP to cut file size ~6x for shipping.
- Finer motion (independent tips, single leaves) = more layer slices through the same pipeline. The layer stack also maps directly onto a later 3D/parallax build.
