# Perf baseline

Commit: `99143c2` • Scene scenario: **idle → one voice per group (all visuals active)**

Captured with `tools/perf/perf-run.mjs` against the worktree dev server (`:3100`).
CPU ms / heap / commits / longtasks are reliable everywhere; **GPU ms requires
real hardware** (headed run) — SwiftShader (headless) has no timer query.

## Real GPU (headed, on real hardware) — the authoritative baseline

### swamp
| checkpoint | CPU ms | GPU ms | budget % | heap MB | commits | longtasks |
|---|---|---|---|---|---|---|
| idle | 0.90 | 0.54 | 9 | 18.3 | 5 | 2 |
| all groups active | 1.00 | 0.63 | 10 | 16.8 | 15 | 2 |

### mornings
| checkpoint | CPU ms | GPU ms | budget % | heap MB | commits | longtasks |
|---|---|---|---|---|---|---|
| idle | 0.90 | 0.41 | 8 | 30.8 | 5 | 1 |
| all groups active | 2.10 | 0.47 | 15 | 18.6 | 15 | 1 |

### moonrise
| checkpoint | CPU ms | GPU ms | budget % | heap MB | commits | longtasks |
|---|---|---|---|---|---|---|
| idle | 1.50 | 1.01 | 15 | 26.8 | 5 | 0 |
| all groups active | 1.60 | 0.98 | 16 | 37.9 | 15 | 0 |

## Findings

- **The cost is CPU/JS, not GPU.** GPU is ≤1ms/frame in every scene/state →
  shaders/draws are cheap. Optimization targets JavaScript, not the GPU.
- **mornings is the standout:** idle→active CPU **0.9 → 2.1ms (+130%)** while GPU
  barely moves — the per-frame JS for the active subjects (Analyser FFT/bucketing
  + subject updates) scales with voices. Clearest target.
- **moonrise has the highest *resting* cost:** idle CPU 1.5 + GPU 1.0 (~15% budget
  at rest) — its always-on elements (stars/particles). Second target.
- **swamp is cheap** (barely moves, ≤10% budget).
- **All scenes sit under ~16% of the 16.7ms frame budget on this hardware** — no
  dropped frames, large headroom. So B2 is *efficiency/headroom* work (lower CPU →
  battery; and these numbers scale up materially on weaker/mobile GPUs), not a
  perf rescue.
- Heap is GC-noisy (mornings idle 30.8 → active 18.6 went *down*) — treat as a soft
  signal, not a target. React commits per interaction stay minimal (re-renders not
  a factor, as expected).

## Headless reference (CI-portable metrics; GPU not measurable headless)

For run-to-run CPU/heap/commit/longtask regression checks without a GPU:
`node tools/perf/perf-run.mjs --label <name>` (defaults to all scenes).

## How to reproduce

1. `tools/worktree-dev.sh perf-review quality 3100` (or any worktree on `:3100`).
2. Headed (full, real GPU): `node tools/perf/perf-run.mjs --headed --label <name>`.
   Headless (CPU/heap only): `node tools/perf/perf-run.mjs --label <name>`.
3. Diff `tools/perf/reports/<name>.json` against this baseline.
4. Live overlay: `http://localhost:3100/play/<scene>?perf=1` in real Chrome —
   stats.js panels show FPS / MS / CPU ms / GPU ms live.

## Investigation: mornings' +1.2ms-when-loaded → B2 parked

Profiled mornings at full visual load (`tools/perf/perf-profile.mjs`). The JS is
cheap and has **no hotspot** — 94% of samples are `(program)` (native + vsync
idle); every JS function (the three.js render path, `getByteFrequencyData`,
`renderMelody`, …) is <0.2% self-time each. Since JS runs identically headless and
headed, the headed-only +1.2ms is **WebGL draw-call / native-driver overhead**
from the extra active meshes — not optimizable JavaScript.

The only lever is **draw-call reduction** (merging/instancing the per-voice scene
geometry) — an involved, risky change to the hand-tuned art for marginal headroom
(all scenes already <16% of the frame budget on real hardware).

**Decision: B2 parked.** No cheap win; the app is healthy. The measure-first step
did its job. Revisit only if perf becomes a real concern (e.g. weak/mobile GPUs) —
the telemetry overlay, harness, profiler, and this baseline are the tools to do it.
