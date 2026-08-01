import type { BakedFrame } from "./bakeSignal";
import { computeOnsetStrength, type OnsetOptions } from "./bakeUtils";

/**
 * Causal exponential smoothing (forward pass only). Lags the signal — this is the
 * "before": the same kind of group-delay the runtime's live AnalyserNode
 * (`smoothingTimeConstant`) introduces. Kept for A/B reference.
 */
export function causalSmooth(series: number[], coef: number): number[] {
  const n = series.length;
  const out = new Array<number>(n);
  let prev = n ? series[0] : 0;
  for (let i = 0; i < n; i++) {
    prev = coef * prev + (1 - coef) * series[i];
    out[i] = prev;
  }
  return out;
}

/**
 * Zero-phase smoothing: run the exponential smoother forward, then backward, so
 * the two group delays cancel (filtfilt-style). You get jitter-free smoothing with
 * ~no net lag — the offline trick a live causal filter physically can't do. Because
 * the smoother is applied twice, the effective strength is squared; use a smaller
 * `coef` than you would causally.
 */
export function zeroPhaseSmooth(series: number[], coef: number): number[] {
  const n = series.length;
  if (n === 0) return [];
  const fwd = new Array<number>(n);
  let p = series[0];
  for (let i = 0; i < n; i++) {
    p = coef * p + (1 - coef) * series[i];
    fwd[i] = p;
  }
  const out = new Array<number>(n);
  p = fwd[n - 1];
  for (let i = n - 1; i >= 0; i--) {
    p = coef * p + (1 - coef) * fwd[i];
    out[i] = p;
  }
  return out;
}

/**
 * Shift the series earlier by `leadFrames` — each frame samples `leadFrames` into
 * the future (clamped at the end). Makes the reaction anticipate slightly, which
 * reads as "on the beat" (video-early is perceptually forgiving). Offline-only:
 * it needs future samples. `leadFrames <= 0` is a pass-through.
 */
export function leadShift(series: number[], leadFrames: number): number[] {
  if (leadFrames <= 0) return series.slice();
  const n = series.length;
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = series[Math.min(i + leadFrames, n - 1)];
  return out;
}

function channel(frames: BakedFrame[], pick: (f: BakedFrame) => number): number[] {
  return frames.map(pick);
}

/**
 * Turn a RAW bake (analyser `smoothingTimeConstant: 0`, i.e. instantaneous FFT)
 * into a "snappy" one: zero-phase smooth every channel (volume + each bucket) so
 * it's clean but lag-free, then lead-shift so it anticipates. This is the whole
 * point of the experiment — the same information the current causal bake has, but
 * smoothed without delay and nudged slightly early. `onset` is recomputed from
 * the smoothed+shifted buckets rather than carried over, so flux is measured on
 * the same clean signal the binding will actually see.
 */
export function snappifyFrames(
  frames: BakedFrame[],
  opts: { coef: number; leadFrames: number; onset?: OnsetOptions }
): BakedFrame[] {
  const { coef, leadFrames } = opts;
  const vol = leadShift(zeroPhaseSmooth(channel(frames, (f) => f.volume), coef), leadFrames);
  const numBuckets = frames.length ? frames[0].buckets.length : 0;
  const buckets: number[][] = [];
  for (let b = 0; b < numBuckets; b++) {
    buckets.push(
      leadShift(
        zeroPhaseSmooth(
          channel(frames, (f) => f.buckets[b] ?? 0),
          coef
        ),
        leadFrames
      )
    );
  }
  const out = frames.map((_, i) => ({
    volume: vol[i],
    buckets: buckets.map((series) => series[i]),
    onset: 0,
  }));
  const onset = computeOnsetStrength(out, opts.onset);
  out.forEach((f, i) => {
    f.onset = onset[i];
  });
  return out;
}
