import { describe, it, expect } from "vitest";
import { computeOnsetFlux, computeOnsetStrength, frameTimes, synthNoise, toMono } from "./bakeUtils";

describe("frameTimes", () => {
  it("returns floor(duration*fps) frame-center times within (0, duration)", () => {
    const t = frameTimes(30, 1);
    expect(t.length).toBe(30);
    expect(t[0]).toBeCloseTo(0.5 / 30, 10);
    expect(t[29]).toBeCloseTo(29.5 / 30, 10);
    expect(t[0]).toBeGreaterThan(0);
    expect(t[29]).toBeLessThan(1);
  });
});

describe("computeOnsetFlux", () => {
  it("spikes on bucket increases and ignores decreases", () => {
    const frames = [
      { buckets: [0.1, 0.1] },
      { buckets: [0.8, 0.1] }, // +0.7 attack
      { buckets: [0.4, 0.1] }, // decay only
    ];
    const flux = computeOnsetFlux(frames);
    expect(flux[0]).toBe(0);
    expect(flux[1]).toBeCloseTo(0.7, 10);
    expect(flux[2]).toBe(0);
  });
});

describe("computeOnsetStrength", () => {
  // A hit at frame 10, then a sustained-but-wobbling plateau: raw flux jitters
  // through the plateau; the processed signal must not.
  const N = 40;
  const frames = Array.from({ length: N }, (_, i) => {
    if (i < 10) return { buckets: [0.05] };
    if (i === 10) return { buckets: [0.9] };
    return { buckets: [0.6 + 0.02 * (i % 2)] }; // sustained with small jitter
  });

  it("pulses on the transient and decays smoothly (no one-frame flicker)", () => {
    const s = computeOnsetStrength(frames);
    const peak = Math.max(...s);
    expect(s[10]).toBe(peak);
    // envelope: the frames right after the hit hold a decaying tail
    expect(s[11]).toBeGreaterThan(0.5 * peak);
    expect(s[11]).toBeLessThan(s[10]);
    expect(s[12]).toBeLessThan(s[11]);
  });

  it("suppresses jitter during sustained sound", () => {
    const s = computeOnsetStrength(frames);
    const peak = Math.max(...s);
    // deep into the plateau (past the envelope tail + mean window)
    for (let i = 25; i < N; i++) expect(s[i]).toBeLessThan(0.05 * peak);
  });

  it("handles empty and constant input", () => {
    expect(computeOnsetStrength([])).toEqual([]);
    const flat = computeOnsetStrength(Array.from({ length: 10 }, () => ({ buckets: [0.5] })));
    expect(flat.every((v) => v === 0)).toBe(true);
  });
});

describe("toMono", () => {
  const fakeBuffer = (channels: number[][]) => ({
    length: channels[0].length,
    numberOfChannels: channels.length,
    getChannelData: (c: number) => new Float32Array(channels[c]),
  });

  it("averages channels", () => {
    const m = toMono(fakeBuffer([[1, 0.5], [0, 0.5]]));
    expect(Array.from(m)).toEqual([0.5, 0.5]);
  });

  it("copies mono input (not a live view)", () => {
    const buf = fakeBuffer([[0.25, -0.25]]);
    const m = toMono(buf);
    expect(Array.from(m)).toEqual([0.25, -0.25]);
    expect(m).not.toBe(buf.getChannelData(0));
  });
});

describe("synthNoise", () => {
  it("is deterministic for a given seed", () => {
    const a = synthNoise({ sampleRate: 1000, durationSec: 0.1, toneSec: 0.1, seed: 42 });
    const b = synthNoise({ sampleRate: 1000, durationSec: 0.1, toneSec: 0.1, seed: 42 });
    expect(Array.from(a)).toEqual(Array.from(b));
  });

  it("fills the active region with energy and the tail with exact silence", () => {
    const s = synthNoise({ sampleRate: 1000, durationSec: 1, toneSec: 0.5, seed: 7 });
    expect(s.length).toBe(1000);
    expect(s.slice(0, 500).some((v) => v !== 0)).toBe(true);
    expect(s.slice(500).every((v) => v === 0)).toBe(true);
  });

  it("stays within [-amplitude, amplitude]", () => {
    const s = synthNoise({ sampleRate: 1000, durationSec: 0.05, toneSec: 0.05, amplitude: 0.5 });
    expect(s.every((v) => v >= -0.5 && v <= 0.5)).toBe(true);
  });
});
