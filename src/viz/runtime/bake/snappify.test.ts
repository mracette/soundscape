import { describe, test, expect } from "vitest";
import { causalSmooth, zeroPhaseSmooth, leadShift, snappifyFrames } from "./snappify";

/** Weighted center-of-mass index of a series — where its "energy" sits in time. */
function centerOfMass(series: number[]): number {
  let num = 0;
  let den = 0;
  series.forEach((v, i) => {
    num += i * v;
    den += v;
  });
  return num / den;
}

describe("snappify", () => {
  // An impulse at index 20 in a length-41 series.
  const N = 41;
  const K = 20;
  const impulse = Array.from({ length: N }, (_, i) => (i === K ? 1 : 0));

  test("zero-phase smoothing keeps the signal centered (no net delay)", () => {
    const zp = zeroPhaseSmooth(impulse, 0.6);
    // Smoothed, but its center of mass stays on the original impulse index.
    expect(centerOfMass(zp)).toBeCloseTo(K, 1);
    // It actually spread the impulse (it's smoothing, not identity).
    expect(zp[K]).toBeLessThan(1);
    expect(zp[K - 3]).toBeGreaterThan(0);
    expect(zp[K + 3]).toBeGreaterThan(0);
  });

  test("causal smoothing lags (center of mass shifts later)", () => {
    const cs = causalSmooth(impulse, 0.6);
    // The whole point: causal pushes the energy AFTER the event.
    expect(centerOfMass(cs)).toBeGreaterThan(K + 0.5);
    // ...and zero-phase is meaningfully earlier than causal for the same coef.
    expect(centerOfMass(zeroPhaseSmooth(impulse, 0.6))).toBeLessThan(centerOfMass(cs));
  });

  test("lead shift samples from the future and clamps at the end", () => {
    expect(leadShift([0, 1, 2, 3, 4], 2)).toEqual([2, 3, 4, 4, 4]);
    expect(leadShift([0, 1, 2, 3, 4], 0)).toEqual([0, 1, 2, 3, 4]);
    // A leading version peaks earlier than the original.
    const zp = zeroPhaseSmooth(impulse, 0.6);
    expect(centerOfMass(leadShift(zp, 3))).toBeCloseTo(K - 3, 1);
  });

  test("snappifyFrames preserves shape and finiteness across volume + buckets", () => {
    const frames = Array.from({ length: N }, (_, i) => ({
      volume: i === K ? 1 : 0,
      buckets: [i === K ? 1 : 0, i === K - 5 ? 1 : 0],
      onset: 0,
    }));
    const out = snappifyFrames(frames, { coef: 0.6, leadFrames: 2 });
    expect(out.length).toBe(N);
    expect(out.every((f) => Number.isFinite(f.volume) && f.buckets.length === 2)).toBe(true);
    expect(out.every((f) => f.buckets.every(Number.isFinite))).toBe(true);
    // Bucket 0's impulse (at K) leads + stays roughly centered near K - lead.
    expect(centerOfMass(out.map((f) => f.buckets[0]))).toBeCloseTo(K - 2, 0);
  });

  test("empty input is handled", () => {
    expect(zeroPhaseSmooth([], 0.5)).toEqual([]);
    expect(snappifyFrames([], { coef: 0.5, leadFrames: 2 })).toEqual([]);
  });

  test("onset options flow through to computeOnsetStrength", () => {
    const frames = Array.from({ length: N }, (_, i) => ({
      volume: 0,
      buckets: [i === K ? 1 : 0],
      onset: 0,
    }));
    const short = snappifyFrames(frames, { coef: 0.3, leadFrames: 0, onset: { decayPerFrame: 0.1 } });
    const long = snappifyFrames(frames, { coef: 0.3, leadFrames: 0, onset: { decayPerFrame: 0.95 } });
    const peakIdx = long.reduce((p, f, i, a) => (f.onset > a[p].onset ? i : p), 0);
    // a longer decay must retain more energy a few frames after the peak
    expect(long[peakIdx + 4].onset).toBeGreaterThan(short[peakIdx + 4].onset);
  });
});
