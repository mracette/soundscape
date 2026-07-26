# The SOUNDSCAPE hero wordmark

A custom rune alphabet whose sixth letter is a vertical sigil standing in for the
second S, inspired by the *Horizon Forbidden West* cover logo. It replaces the
`Satisfy` Google font on the landing page.

The mark ships as painted artwork — `public/img/soundscape-wordmark.webp` —
applied as a CSS mask over `currentColor`. A mask rather than an `<img>` because
the artwork is monochrome, so one channel carries all of it, and the colour stays
under CSS control instead of being baked in.

## Files

| | |
|---|---|
| `00-original-pick.webp` | the source key art everything derives from |
| `extract-abstract.webp` | the wordmark keyed out of that key art |
| `shape-reference.webp` | proportions and sigil height, rendered from `build-wordmark.py` |
| `final-render.webp` | the chosen regeneration, source of the shipped mask |
| `build-wordmark.py` | procedural geometry → `soundscape.svg` / the shape reference |
| `matte-wordmark.py` | a render → the shipped alpha mask |

## Regenerating

1. **Extract** a rough abstract from the key art, keying on *cyan-ness*
   (`min(G,B) - 0.75R`) rather than luminance — that drops the green grass and
   the dark trees in one step, which a luminance key cannot.

2. **Set proportion in `build-wordmark.py`**, not in the prompt. An image model
   will not hit a size ratio on request. The sigil's `scale` in `WORD` controls
   how far it towers over the letters; it sits at `0.68` (~2.3x cap height).
   Render it to get `shape-reference`.

3. **Regenerate** with an image model, passing **two** references — the shape
   reference for layout and sigil height, the extract for material and
   letterform character — and say explicitly what to take from each.

   Image models keep drawing `SOUND` + sigil + `SCAPE`, i.e. a stray second S.
   Spelling out *"exactly ten letters S,O,U,N,D,S,C,A,P,E … the four letters
   after the sigil read C,A,P,E"* held it across every generation. Verify by
   counting.

4. **Matte** with `matte-wordmark.py <render> public/img/soundscape-wordmark.webp`.
   If the artwork changes, re-measure `SIGIL_X` in `WordmarkParticles.tsx` — it is
   the sigil's centre as a fraction of the artwork's width, found from the columns
   with the tallest vertical ink extent.

## Things that cost time — don't rediscover them

- **`mask-image` keys on the alpha channel, not luminance.** A greyscale image has
  no alpha, so it masks in as a solid rectangle. Coverage must live in alpha.
- **Pillow always writes WebP alpha losslessly** and ignores `alpha_quality`. That
  is the difference between a 230KB and a 97KB file, so `matte-wordmark.py` shells
  out to `cwebp -alpha_q 70` (worst pixel off by 10/255 — invisible on a glow).
- The bloom is baked into the mask's alpha, so the CSS filter only has to widen
  it. Treating it as the whole glow doubles up.

## On the procedural version

`build-wordmark.py` draws the whole wordmark from chisel-cut stroke primitives and
still emits `soundscape.svg`. That was the original approach and it is kept
because it is what controls proportion, but its facets read as procedural beside
the painted art, which is why the shipped mark is a render.

Two things it taught that carried over into the artwork, both measured off the key
art rather than eyeballed (eyeballing put the first attempt 60% too heavy):

- At cap height 200, letter strokes run ~19–23, the D ~23, the sigil ~31–34. That
  heavy/light contrast between sigil and letters is most of the carved look.
- **A stroke holds full width along its body and tapers only into a short terminal
  spike.** Tapering the whole stroke is what makes lettering read as blackletter
  rather than carved.
