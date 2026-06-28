# Soundscape

## Conventions

- Compose `className` values with the `cx` helper (`src/utils/cx.ts`), including
  the conditional case — `cx(base, isActive && activeClass)` — rather than
  template literals or manual string concatenation.

## three.js versions

This project runs two copies of three.js side by side:

- `three` — the latest release, used by new content under `src/viz/runtime/`.
- `three-legacy` — `three@0.108.0`, used by the original scenes (Moonrise,
  Mornings, Swamp). It is pinned **deliberately**; those scenes depend on its
  behavior. Do not "upgrade" it or fold it back into `three`.

New code imports `three` and `three/addons/<path>.js`. Legacy code imports
`three-legacy` and `three-legacy/examples/jsm/<path>`.
