# Performance & diagnostics tooling

Dev-only tools for measuring this app's runtime: per-frame compute, CPU hotspots,
and memory leaks. None of this ships — the in-app seam is gated behind
`import.meta.env.DEV` and dead-code-eliminated from production builds.

All of it reads real runtime state through a read-only seam the app installs in
dev (`window.__soundscape`, see `src/testHooks.ts`), plus the WebGL/telemetry hook
(`window.__perf`) enabled by the `?perf=1` URL flag.

## Quick start

These tools drive a live dev server. To avoid clobbering your main checkout, run
them against an **isolated worktree on its own port**:

```bash
tools/worktree-dev.sh perf-review quality 3100   # worktree off `quality`, dev server on :3100
```

`worktree-dev.sh <branch> [base] [port]` creates the worktree, installs deps, and
**symlinks the gitignored runtime assets** (`public/audio`, `public/models`) from
the source checkout — without them the scenes can't load (those binaries aren't in
git). Then point any tool below at `:3100` (the default).

## Live overlay — spot-checking by eye

Open a scene with the flag in **real Chrome** (a real GPU; headless can't measure GPU):

```
http://localhost:3100/play/swamp?perf=1
```

A stats.js panel (top-right) shows **FPS / MS / CPU ms / GPU ms** live as you
interact. Best for *finding* a hotspot. `?perf=1` also exposes
`window.__perf.snapshot()`.

## `perf-run.mjs` — frame-cost regression harness

Runs a fixed scenario (idle → one voice per group = all visuals active) across all
scenes and writes a diffable report.

```bash
node tools/perf/perf-run.mjs --headed --label baseline-headed     # real GPU (full numbers)
node tools/perf/perf-run.mjs --label ci-style                     # headless (CPU/heap only)
```

Flags: `--headed` (real GPU; otherwise headless), `--song <swamp|mornings|moonrise|all>`
(default `all`), `--label <name>`, `--url <base>` (default `http://localhost:3100`).

Columns: **CPU ms** (JS render + analyser, reliable everywhere), **GPU ms**
(`EXT_disjoint_timer_query`; real-hardware only, `—` headless), **budget %** of the
16.7ms frame, **heap MB**, **React commits** per checkpoint, **long tasks**. Writes
`reports/<label>.json` — diff it against `BASELINE.md`. The checkpoint with the
highest CPU/budget is the first thing to investigate.

## `perf-profile.mjs` — CPU hotspot breakdown

Function-level self-time at full scene load. Run **headed** for the real driver/JS cost.

```bash
node tools/perf/perf-profile.mjs --headed --song mornings
```

Flags: `--headed`, `--song` (default `mornings`), `--secs <n>` (default 5), `--url`.
Prints the top self-time functions and saves a `reports/profile-<song>.cpuprofile`
(load it in Chrome DevTools → Performance). Note: a high `(program)` share means the
time is native/idle (GPU driver, vsync wait), not optimizable JS.

## `leak-check.mjs` — memory-leak detector

Toggles voices over a long, spaced session (so animations actually fire and
complete), settles to idle, and watches the things that leak: **live GSAP tweens**,
**pending scheduler events**, **store voices**, and **JS heap** (post-GC).

```bash
node tools/perf/leak-check.mjs                                   # swamp, 40 toggles @2s
node tools/perf/leak-check.mjs --toggles 150 --spacing 2500 --song mornings --headed
```

Stable counts (tweens/queue drain to 0 at idle, heap plateaus) = no leak; monotonic
growth = a leak. Prints a per-checkpoint table + a ✓/⚠ verdict. Run it from time to
time after changing the viz or audio teardown paths — **not in CI** (it's slow and
needs a settle).

## The dev seam (`window.__soundscape`, dev only)

Read-only, installed by `AppWrap` under `import.meta.env.DEV`:

| accessor | returns |
|---|---|
| `store()` | the Zustand store snapshot (`voices`, `groups`, …) |
| `gain(songId, group)` | a group's WebAudio gain value |
| `premasterGain()` | the master gain value |
| `gsapTweens()` | count of live GSAP tweens (leak signal) |
| `schedulerQueue()` | pending scheduler events (leak signal) |

The e2e suite (`e2e/`) also uses this seam; that suite *is* the CI gate. These perf
tools are the manual, run-when-you-need-them counterpart.

## Notes

- **GPU is only real on `--headed`** real hardware. Headless uses SwiftShader (software)
  which has no timer query and distorts timing — useful only for CPU/heap/leak metrics.
- **FPS is capped to 60** in the render loop (`SceneManager.animate`, `TARGET_FPS`) — on
  high-refresh displays this halves per-second energy. It only ever throttles *down*;
  it's a no-op when the display's RAF is already ≤60.
- Reports under `reports/` are gitignored run artifacts.
- See `BASELINE.md` for the current reference numbers and findings.
