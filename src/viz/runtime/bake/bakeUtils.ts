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
