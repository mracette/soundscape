import { describe, it, expect } from "vitest";
import { frameTimes, synthNoise } from "./bakeUtils";

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
