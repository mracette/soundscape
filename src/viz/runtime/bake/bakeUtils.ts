/**
 * Per-frame sample times in seconds — one per frame at the frame center
 * `(i + 0.5)/fps`, so they fall strictly inside `(0, durationSec)`. Frame
 * centers avoid `suspend(0)` (invalid) and a suspend at exactly the render end.
 */
export function frameTimes(fps: number, durationSec: number): number[] {
  const count = Math.floor(durationSec * fps);
  const times: number[] = [];
  for (let i = 0; i < count; i++) times.push((i + 0.5) / fps);
  return times;
}

/**
 * Rescale each series (volume, onset, and each bucket index) so its own loudest
 * sample across the bake becomes 1.0. Program material rarely drives the
 * analyser near its ceiling, so an un-normalized bake leaves bindings with
 * `exponent > 1` stuck near `outMin` no matter how loud the track gets. Buckets
 * are normalized independently, not against a shared band-wide peak — different
 * frequency ranges carry very different absolute energy, so a bucket bound by a
 * binding needs headroom relative to its own peak, not whichever bucket happens
 * loudest.
 */
export function normalizeToPeak<T extends { volume: number; buckets: number[]; onset: number }>(
  frames: T[]
): T[] {
  if (frames.length === 0) return frames;
  let volumePeak = 0;
  let onsetPeak = 0;
  const bucketPeaks = new Array(frames[0].buckets.length).fill(0);
  for (const f of frames) {
    if (f.volume > volumePeak) volumePeak = f.volume;
    if (f.onset > onsetPeak) onsetPeak = f.onset;
    f.buckets.forEach((b, i) => {
      if (b > bucketPeaks[i]) bucketPeaks[i] = b;
    });
  }
  return frames.map((f) => ({
    ...f,
    volume: volumePeak > 0 ? f.volume / volumePeak : f.volume,
    onset: onsetPeak > 0 ? f.onset / onsetPeak : f.onset,
    buckets: f.buckets.map((b, i) => (bucketPeaks[i] > 0 ? b / bucketPeaks[i] : b)),
  }));
}

/**
 * Spectral flux per frame: the sum of positive frame-to-frame bucket increases.
 * Spikes on a transient (a kick, a snare hit) and stays near zero through
 * sustained tone. This is the raw detection function; use computeOnsetStrength
 * for the animation-ready signal. Frame 0 has no predecessor and is always 0.
 */
export function computeOnsetFlux(frames: { buckets: number[] }[]): number[] {
  const out = new Array<number>(frames.length).fill(0);
  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1].buckets;
    const cur = frames[i].buckets;
    let flux = 0;
    for (let b = 0; b < cur.length; b++) flux += Math.max(0, cur[b] - (prev[b] ?? 0));
    out[i] = flux;
  }
  return out;
}

/** Tuning for computeOnsetStrength. windowFrames: local-mean span; decayPerFrame: envelope retention. */
export interface OnsetOptions {
  windowFrames?: number;
  decayPerFrame?: number;
}

/**
 * Animation-ready onset signal — the classic MIR post-processing chain
 * (Bello/Dixon, same shape as librosa's onset_strength) over raw spectral flux:
 *
 * 1. log compression, so one loud hit doesn't dwarf every quieter hit after
 *    peak normalization;
 * 2. sliding local-mean subtraction + half-wave rectification, so only jumps
 *    relative to the recent past survive — this removes the frame-to-frame
 *    jitter raw flux shows during sustained sound;
 * 3. an instant-attack / exponential-decay envelope, turning single-frame
 *    spikes into a short readable pulse instead of a one-frame flicker.
 *
 * `windowFrames` is the local-mean span; `decayPerFrame` is the envelope's
 * per-frame retention (higher = longer tail). Defaults are tuned for ~30fps.
 */
export function computeOnsetStrength(
  frames: { buckets: number[] }[],
  opts: OnsetOptions = {}
): number[] {
  const { windowFrames = 9, decayPerFrame = 0.8 } = opts;
  const n = frames.length;
  const flux = computeOnsetFlux(frames).map((v) => Math.log1p(10 * v));
  const half = Math.floor(windowFrames / 2);
  const detail = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    const lo = Math.max(0, i - half);
    const hi = Math.min(n - 1, i + half);
    let mean = 0;
    for (let j = lo; j <= hi; j++) mean += flux[j];
    mean /= hi - lo + 1;
    detail[i] = Math.max(0, flux[i] - mean);
  }
  const out = new Array<number>(n);
  let env = 0;
  for (let i = 0; i < n; i++) {
    env = Math.max(detail[i], env * decayPerFrame);
    out[i] = env;
  }
  return out;
}

/**
 * Deterministic mono test signal: seeded-LCG broadband noise in
 * `[-amplitude, amplitude]` for the first `toneSec`, then exact silence to
 * `durationSec`. Broadband (vs a pure tone) so the baked mean volume is clearly
 * elevated while sound plays — lets the bake be proven without a fixture file.
 */
export function synthNoise(opts: {
  sampleRate: number;
  durationSec: number;
  toneSec: number;
  seed?: number;
  amplitude?: number;
}): Float32Array {
  const { sampleRate, durationSec, toneSec, seed = 1, amplitude = 1 } = opts;
  const n = Math.floor(durationSec * sampleRate);
  const active = Math.floor(toneSec * sampleRate);
  const out = new Float32Array(n);
  let s = seed >>> 0;
  for (let i = 0; i < active; i++) {
    s = (s * 1664525 + 1013904223) >>> 0; // numerical-recipes LCG
    out[i] = amplitude * ((s / 0xffffffff) * 2 - 1);
  }
  return out; // tail stays 0 (silence)
}
