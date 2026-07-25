# Landing scene experiment: what we learned

Retrospective on the `landing-atmosphere` branch (July 2026), where the
landing page's flat treeline was reworked into a moonlit river receding
through forested banks, art-directed against an AI-generated poster. This
captures what to keep, what to avoid, and how to architect the next scene
attempts. The branch is a working prototype; nothing here is merged.

## What was built

Five three.js "subjects" composited as 2D layers under an orthographic
camera (all in `src/viz/subjects/`):

| Layer (renderOrder) | What it is |
| --- | --- |
| Water (opaque pass) | One full-band quad, everything in the fragment shader |
| Sky (-1) | Top darkening + corner vignette |
| Back fog (2) | fbm mist + moonlit glow above the horizon |
| Ember (2.55) / far strip (2.6) | Warm glow at the channel mouth, behind the old treeline silhouette |
| Pockets (3) / banks (4) | Glow pools behind ~200 individually-placed tree sprites |
| Shore mist (5.5) | Channel-aware mist pooling along the shorelines |

The channel geometry (`channelAt(t)` in `LandingPageWater.ts`) is the one
source of truth, written in both TS (bank/tree placement at raster time)
and GLSL (water and mist shaders), so land, water, and atmosphere always
agree where the shoreline is.

## What worked — keep doing these

**Single-quad shader water.** The entire water surface — winding light
lane, dark bank reflections, waterline sliver, ripple bands, stardust
swirls, twinkling glints — is one quad with one fragment shader. Cheap per
frame, fully animated, and the best-looking part of the scene. The load-
bearing tricks, all reusable:

- A *cross-channel coordinate* `u = (x − center(t)) / halfWidth(t)`
  makes every effect follow the channel for free.
- A *wobbled* copy of it (`uw = u + noise`) gives every edge a wavy
  waterline. Straight edges are what make water read as a road.
- *Perspective compression* `pv = 1/(1.12 − y)` squeezes texture rows
  toward the horizon — instant fake 3D on a flat quad.
- *Dark bank reflections* are the signature that makes a surface read as
  water at all; a bright thin sliver separates land from its reflection.
- Broken/grainy light beats smooth light: dashes across the lane,
  noise-isoline "swirl currents," sparkle grain. Smooth analytic
  gradients read cartoony.

**Analytic glows for atmosphere.** Gaussian/exp falloffs + fbm breakup +
slow breathing sine = "magical light," dirt cheap. The one placement rule
that mattered: put the glow *behind* the silhouette layer so trees are
backlit. Light painted *on top of* silhouettes reads as smears.

**Sub-LSB dither, always.** Smooth gradients over a near-black scene band
visibly in 8-bit output. `col += (hash(gl_FragCoord.xy) − .5) / 128.` at
the end of every gradient shader dissolves the bands into invisible
grain. Any future dark scene needs this from day one.

**The vector-silhouette asset pipeline.** Image gen (black-on-white,
"suitable for vectorization") → threshold → potrace → SVG → rasterize at
viewport-exact pixel size at runtime. Produced the treeline, 9 individual
trees, and (without potrace) the galaxy title art in minutes each. For
the title: generate on solid black, `mix-blend-mode: screen` over the
night sky — no visible plate, stars show through.

**Shared geometry constants (TS + GLSL).** Emitting the same formula into
the shader via template string kept four independent systems aligned
through every iteration. Do this for any scene where raster-time layout
and shader-time drawing must agree.

**Deterministic placement.** Seeded PRNG (mulberry32) so a resize rebuild
doesn't reshuffle the forest.

**Continuous depth, not rows.** Placing sprites in discrete depth rows
produced visible horizontal seams (aligned bases, stepped tints). Fix:
bands only order the painting; every sprite jitters its own depth and
derives size/tint/blur/base from it continuously.

## Composition lessons (they transfer to any scene)

- **Exponential size falloff** with depth, not linear — linear reads as a
  colonnade, exponential reads as perspective. Huge anchors in the near
  corners, tiny elements at the vanishing point.
- **Guaranteed hero elements.** Don't leave frame-edge anchors to random
  placement; plant them deterministically.
- **The darkness budget is the design.** Most failed iterations came from
  lifting everything (snow-field look) or darkening everything
  (black-on-black, invisible silhouettes). What stays dark is as
  important as what glows; silhouettes need luminous background *behind*
  them specifically.
- **UI-aware layout.** Translucent UI chips over a bright scene zone read
  as a pale panel ("the white rectangle"). Keep bright scene zones out
  from under the UI, or the UI becomes part of the composition.
- **Full-width anything is a stripe.** Mist, glow bands, fog layers must
  be weighted toward a focal point (e.g. the channel) or they read as
  rectangles.
- Target roughly 60% of the reference art's density — a poster fills
  every inch; a landing page needs dead air.

## What didn't work

**Performance of the raster pipeline.** Resize is visibly stuttery, and
the same cost is paid on initial load. Diagnosis (architectural, not yet
profiled):

- Every rebuild rasterizes two full-viewport canvases at up to 2.5×
  DPR (~3600×2250 RGBA ≈ 32 MB each) and uploads them as new
  `CanvasTexture`s.
- The banks draw ~200 sprites, each through a scratch-canvas tint pass,
  many through `ctx.filter = blur(...)` — canvas filter blur is CPU-side
  and slow.
- 10 SVG→blob→Image loads per rebuild.
- Nothing is reused across resizes; the debounce only hides the cost.

Fixes for next time, in order of leverage: rasterize sprites **once** to
a tint/blur-baked atlas at load; on resize, re-*layout* cheap meshes
instead of re-rasterizing textures; cap layer texture resolution below
full DPR (blurred/distant layers don't need it); avoid `ctx.filter`
entirely (bake blur variants into the atlas); or skip the megatexture and
draw sprites as instanced textured quads so the GPU does placement.

**Billboards stop being compelling as the scene gets more 3D.** The
perspective composition works, but the illusion has a ceiling: light
cannot fall *on* a flat silhouette. No rim lighting on trees near the
glow pockets, no depth-correct mist between specific trees, no parallax.
Every step toward simulated 3D exposed this more. Conclusion: 2.5D
layered scenes should stay *graphic* — poster-like, silhouette-and-glow —
and lean on shader-animated surfaces (water, fog, sky) for life. If a
scene concept needs light to visibly interact with objects, it needs real
geometry (three.js meshes/instancing with normals) or pre-lit sprite
variants, which is a different budget class.

**One megatexture = one static image.** Baking all trees into a single
canvas means no per-layer parallax, no per-tree sway, no light response.
Separate meshes per depth layer (with atlas sprites) would keep those
options open at similar draw cost.

## Process lessons

- The screenshot → compare-to-reference → adjust-one-system loop
  converges well on *structural* problems (this reads as a road, the
  trees are invisible, there's banding) and it took ~7 rounds to get from
  "foggy road" to "river." It is much weaker on *taste* — warmth,
  texture density, exact tonal balance needed human eyes each round.
  Budget for that: get structure right autonomously, then ask.
- Static screenshots can't judge motion. The animated water reads far
  better live than in any capture; don't over-tune from stills.
- Naming the failure mode ("snowy highway," "headlights," "coffee-stain
  rings") made the fix obvious each time. The named modes and their
  fixes: road → dark bank reflections + wavy edges; snow field → restore
  the darkness budget; cartoon light → break it up (dashes, grain,
  partial arcs); floating trees → sink bases to varied depths + land
  behind them.

## For the next scene attempts

Start from this stack: shader-quad ground surface (water/sand/cloud sea/
whatever) + analytic glow layers + dithering + silhouette sprites from
the potrace pipeline — but build the sprite atlas once at load, lay out
meshes on resize, and decide up front whether the concept needs real
lighting interaction. If it does, prototype the lighting in real geometry
first; if it doesn't, keep it proudly flat and spend the budget on shader
motion, which is where the life comes from.
