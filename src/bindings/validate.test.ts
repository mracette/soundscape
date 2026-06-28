import { describe, it, expect } from "vitest";
import { validateUserData } from "./validate";
import type { SoundscapeUserData } from "./types";

const valid: SoundscapeUserData = {
  bindings: [
    {
      target: { property: "emissiveIntensity" },
      source: { band: "melody", measure: "bucket", bucket: 3 },
      transform: {
        exponent: 2,
        ease: "easeCubicOut",
        smoothing: { attack: 0.6, release: 0.2 },
        outMin: 0,
        outMax: 1.5,
      },
    },
    {
      target: { property: "scale.y" },
      source: { band: "bass", measure: "volume" },
      transform: { outMin: 1, outMax: 1.4 },
    },
  ],
};

describe("validateUserData", () => {
  it("accepts a fully valid userData object", () => {
    expect(validateUserData(valid)).toEqual({ valid: true, errors: [] });
  });

  it("rejects a non-object", () => {
    expect(validateUserData(null).valid).toBe(false);
  });

  it("rejects missing bindings array", () => {
    const r = validateUserData({});
    expect(r.valid).toBe(false);
    expect(r.errors.join(" ")).toContain("bindings must be an array");
  });

  it("rejects an unknown target property", () => {
    const r = validateUserData({
      bindings: [
        {
          target: { property: "wobble" },
          source: { band: "melody", measure: "volume" },
          transform: { outMin: 0, outMax: 1 },
        },
      ],
    });
    expect(r.valid).toBe(false);
    expect(r.errors.join(" ")).toContain("is not a known target");
  });

  it("requires bucket when measure is bucket", () => {
    const r = validateUserData({
      bindings: [
        {
          target: { property: "opacity" },
          source: { band: "melody", measure: "bucket" },
          transform: { outMin: 0, outMax: 1 },
        },
      ],
    });
    expect(r.valid).toBe(false);
    expect(r.errors.join(" ")).toContain("bucket must be a non-negative integer");
  });

  it("rejects bucket when measure is volume", () => {
    const r = validateUserData({
      bindings: [
        {
          target: { property: "opacity" },
          source: { band: "melody", measure: "volume", bucket: 2 },
          transform: { outMin: 0, outMax: 1 },
        },
      ],
    });
    expect(r.valid).toBe(false);
    expect(r.errors.join(" ")).toContain('only allowed when measure is "bucket"');
  });

  it("rejects a non-positive exponent", () => {
    const r = validateUserData({
      bindings: [
        {
          target: { property: "opacity" },
          source: { band: "melody", measure: "volume" },
          transform: { outMin: 0, outMax: 1, exponent: 0 },
        },
      ],
    });
    expect(r.valid).toBe(false);
    expect(r.errors.join(" ")).toContain("exponent must be a positive number");
  });

  it("rejects smoothing values outside [0,1]", () => {
    const r = validateUserData({
      bindings: [
        {
          target: { property: "opacity" },
          source: { band: "melody", measure: "volume" },
          transform: { outMin: 0, outMax: 1, smoothing: { attack: 1.5, release: 0.2 } },
        },
      ],
    });
    expect(r.valid).toBe(false);
    expect(r.errors.join(" ")).toContain("smoothing.attack must be a number in [0,1]");
  });

  it("reports the index of the offending binding", () => {
    const r = validateUserData({
      bindings: [
        {
          target: { property: "opacity" },
          source: { band: "melody", measure: "volume" },
          transform: { outMin: 0, outMax: 1 },
        },
        { target: { property: "nope" }, source: { band: "x", measure: "volume" }, transform: { outMin: 0, outMax: 1 } },
      ],
    });
    expect(r.valid).toBe(false);
    expect(r.errors.join(" ")).toContain("bindings[1]");
  });
});
