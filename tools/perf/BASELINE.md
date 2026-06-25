# Perf baseline

Commit: `d6b0df1` • Date: 2026-06-25 • Scene: swamp • Branch: `perf-review`

Captured with `tools/perf/perf-run.mjs` against the worktree dev server (`:3100`).
CPU ms / heap / commits / longtasks are reliable everywhere; **GPU ms is only
measurable on real hardware** (headed run) — SwiftShader (headless) has no timer
query.

## Headless (CPU / heap / React commits / long tasks)

| checkpoint | CPU ms | GPU ms | budget % | heap MB | commits | longtasks |
|---|---|---|---|---|---|---|
| idle | 1.10 | — | 7 | 14.4 | 5 | 40 |
| 4 voices active | 1.00 | — | 6 | 16.7 | 10 | 148 |
| after randomize | 1.00 | — | 6 | 17.9 | 14 | 195 |

Notes:
- **CPU render is ~1ms/frame** headless — the JS render() + per-frame Analyser
  work is cheap on this scene. (Real-hardware CPU will differ slightly; GPU is the
  unknown — fill in below.)
- **Heap grows ~14.4 → 17.9 MB** as voices start (audio buffers) — small, stable.
- **React commits per interaction are minimal** (a few per checkpoint) —
  re-render waste is not a hotspot (consistent with the earlier finding).
- `longtasks` is cumulative since load; most of the count is initial
  compile/asset-decode, not steady-state.

## Real GPU (headed — run locally on real hardware)

Run on a machine with a real GPU:
```
node tools/perf/perf-run.mjs --headed --label baseline-headed
```
This fills in **GPU ms** via `EXT_disjoint_timer_query` (confirmed available in
Chrome on this hardware). Paste the resulting table here.

| checkpoint | CPU ms | GPU ms | budget % | heap MB | commits | longtasks |
|---|---|---|---|---|---|---|
| _(run --headed to fill in)_ | | | | | | |

## How to reproduce

1. `tools/worktree-dev.sh perf-review quality 3100` (or any worktree on `:3100`).
2. `node tools/perf/perf-run.mjs --label <name> [--headed]`.
3. Diff `tools/perf/reports/<name>.json` against this baseline.
4. Live overlay: open `http://localhost:3100/play/swamp?perf=1` in real Chrome —
   the stats.js panels show FPS / MS / **CPU ms** / **GPU ms** live.

## Hand-off to B2 (optimization)

This baseline is B2's input. From the headless data, **CPU render and re-renders
are already cheap** — so the first question for B2 is whether the real cost is
**GPU** (answered by a `--headed` run) or in a specific path (the Analyser
FFT/bucketing, scene draw). Optimize the checkpoint with the highest
CPU ms / budget %, prove it with a before/after harness diff.
