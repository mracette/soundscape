import { describe, it, expect } from "vitest";
import type { Binding } from "../../bindings";
import { BindingEvaluator } from "./evaluator";

const linear = (t: number) => t;

const binding = (transform: Partial<Binding["transform"]> = {}): Binding => ({
  target: { property: "emissiveIntensity" },
  source: { band: "bass", measure: "volume" },
  transform: { outMin: 0, outMax: 1, ...transform },
});

describe("BindingEvaluator", () => {
  it("maps signal 0 to outMin and 1 to outMax (linear)", () => {
    const e = new BindingEvaluator(binding({ outMin: 2, outMax: 6 }), linear);
    expect(e.evaluate(0)).toBe(2);
    expect(e.evaluate(0.5)).toBe(4);
    expect(e.evaluate(1)).toBe(6);
  });

  it("clamps the input signal to [0,1]", () => {
    const e = new BindingEvaluator(binding({ outMin: 0, outMax: 10 }), linear);
    expect(e.evaluate(-1)).toBe(0);
    expect(e.evaluate(2)).toBe(10);
  });

  it("applies the exponent before easing", () => {
    const e = new BindingEvaluator(binding({ exponent: 2 }), linear);
    expect(e.evaluate(0.5)).toBeCloseTo(0.25, 10);
  });

  it("applies the injected ease function", () => {
    const e = new BindingEvaluator(binding(), (t) => t * t);
    expect(e.evaluate(0.5)).toBeCloseTo(0.25, 10);
  });

  it("eases attack toward a rising signal over successive frames", () => {
    const e = new BindingEvaluator(
      binding({ smoothing: { attack: 0.5, release: 0.5 } }),
      linear
    );
    expect(e.evaluate(1)).toBeCloseTo(0.5, 10); // 0 + (1-0)*0.5
    expect(e.evaluate(1)).toBeCloseTo(0.75, 10); // 0.5 + (1-0.5)*0.5
  });

  it("supports an inverted output range via the final clamp", () => {
    const e = new BindingEvaluator(binding({ outMin: 5, outMax: 1 }), linear);
    expect(e.evaluate(0)).toBe(5);
    expect(e.evaluate(0.5)).toBe(3);
    expect(e.evaluate(1)).toBe(1);
  });

  it("maps a non-finite signal to outMin (NaN-safe)", () => {
    const e = new BindingEvaluator(binding({ outMin: 2, outMax: 6 }), linear);
    expect(e.evaluate(NaN)).toBe(2);
  });

  it("composes exponent before ease (pins pipeline order)", () => {
    const affine = (t: number) => t * 0.5 + 0.25;
    const e = new BindingEvaluator(binding({ exponent: 2 }), affine);
    // 0.5 -> ^2 = 0.25 -> affine = 0.375 (the reversed order would give 0.25)
    expect(e.evaluate(0.5)).toBeCloseTo(0.375, 10);
  });

  it("eases release toward a falling signal over successive frames", () => {
    const e = new BindingEvaluator(
      binding({ smoothing: { attack: 1, release: 0.5 } }),
      linear
    );
    expect(e.evaluate(1)).toBeCloseTo(1, 10);   // attack=1 -> instant to 1
    expect(e.evaluate(0)).toBeCloseTo(0.5, 10); // release: 1 + (0-1)*0.5
    expect(e.evaluate(0)).toBeCloseTo(0.25, 10);// 0.5 + (0-0.5)*0.5
  });

  it("gates the signal to exactly 0 below the threshold", () => {
    const e = new BindingEvaluator(binding({ gate: 0.2 }), linear);
    expect(e.evaluate(0.1)).toBe(0);
    expect(e.evaluate(0.2)).toBe(0);
  });

  it("rescales the gated signal so the surviving range spans 0..1", () => {
    const e = new BindingEvaluator(binding({ gate: 0.2 }), linear);
    expect(e.evaluate(0.6)).toBeCloseTo(0.5, 10); // (0.6-0.2)/(1-0.2)
    expect(e.evaluate(1)).toBeCloseTo(1, 10);
  });

  it("gates before the smoothing envelope (release decays a gated signal to 0)", () => {
    const e = new BindingEvaluator(
      binding({ gate: 0.5, smoothing: { attack: 1, release: 0.5 } }),
      linear
    );
    expect(e.evaluate(1)).toBeCloseTo(1, 10);     // gated 1 -> attack=1 instant
    expect(e.evaluate(0.4)).toBeCloseTo(0.5, 10); // below gate -> 0 input; release halves
    expect(e.evaluate(0.4)).toBeCloseTo(0.25, 10);
  });
});
