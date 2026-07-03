import { describe, it, expect, afterEach, vi } from "vitest";
import {
  clamp,
  normalize,
  lerp,
  solveExpEquation,
  linToLog,
  boundedSin,
  gaussianRand,
  rotatePoint,
} from "./mathUtils";

describe("clamp", () => {
  it("passes through values inside the range and pins values outside it", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe("normalize", () => {
  it("maps min->0, max->1, and interpolates linearly between", () => {
    expect(normalize(0, 0, 10)).toBe(0);
    expect(normalize(10, 0, 10)).toBe(1);
    expect(normalize(5, 0, 10)).toBe(0.5);
    expect(normalize(25, 20, 40)).toBe(0.25);
  });

  it("without doClamp, values outside the range extrapolate past 0..1", () => {
    expect(normalize(15, 0, 10)).toBe(1.5);
    expect(normalize(-2, 0, 10)).toBe(-0.2);
  });

  it("with doClamp, clamps the normalized result to 0..1 (not to min..max)", () => {
    // Deliberate divergence from the old crco-utils normalize, which clamped
    // incorrectly — the clamp applies to the 0..1 output.
    expect(normalize(15, 0, 10, true)).toBe(1);
    expect(normalize(-2, 0, 10, true)).toBe(0);
    expect(normalize(5, 0, 10, true)).toBe(0.5);
  });
});

describe("lerp", () => {
  it("returns the endpoints at t=0 and t=1 and the midpoint at t=0.5", () => {
    expect(lerp(2, 10, 0)).toBe(2);
    expect(lerp(2, 10, 1)).toBe(10);
    expect(lerp(2, 10, 0.5)).toBe(6);
  });

  it("extrapolates beyond the endpoints for t outside 0..1", () => {
    expect(lerp(0, 10, 1.5)).toBe(15);
    expect(lerp(0, 10, -0.5)).toBe(-5);
  });
});

describe("solveExpEquation", () => {
  it("returns a, b such that y = a*b^x passes through both input points", () => {
    // The lpFilter mapping from audioUtils.effectParams
    const { a, b } = solveExpEquation(1, 320, 100, 20000);
    expect(a * Math.pow(b, 1)).toBeCloseTo(320, 8);
    expect(a * Math.pow(b, 100)).toBeCloseTo(20000, 8);
  });
});

describe("linToLog", () => {
  it("returns a, b such that y = a*e^(bx) fixes the endpoints (1,1) and (w,w)", () => {
    const w = 10;
    const { a, b } = linToLog(w);
    expect(a * Math.exp(b * 1)).toBeCloseTo(1, 10);
    expect(a * Math.exp(b * w)).toBeCloseTo(w, 10);
  });
});

describe("boundedSin", () => {
  it("oscillates between yMin and yMax starting at the midpoint", () => {
    const f = boundedSin(2, 0, 1);
    expect(f(0)).toBeCloseTo(0.5, 10);
    expect(f(0.5)).toBeCloseTo(1, 10); // crest
    expect(f(1.5)).toBeCloseTo(0, 10); // trough
    expect(f(2)).toBeCloseTo(0.5, 10); // full period
  });

  it("invert flips the waveform", () => {
    const f = boundedSin(2, 0, 1, 0, 0, true);
    expect(f(0.5)).toBeCloseTo(0, 10);
    expect(f(1.5)).toBeCloseTo(1, 10);
  });
});

describe("gaussianRand", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("averages `factor` uniform samples", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(gaussianRand()).toBe(0.5);
    expect(spy).toHaveBeenCalledTimes(6); // default factor
    expect(gaussianRand(3)).toBe(0.5);
    expect(spy).toHaveBeenCalledTimes(9);
  });
});

describe("rotatePoint", () => {
  it("rotates a point about a center by the given angle", () => {
    const quarter = rotatePoint(1, 0, 0, 0, Math.PI / 2);
    expect(quarter.x).toBeCloseTo(0, 10);
    expect(quarter.y).toBeCloseTo(1, 10);

    const offCenter = rotatePoint(3, 2, 2, 2, Math.PI);
    expect(offCenter.x).toBeCloseTo(1, 10);
    expect(offCenter.y).toBeCloseTo(2, 10);
  });
});
