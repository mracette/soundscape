import { describe, it, expect, vi, test } from "vitest";
import * as d3ease from "d3-ease";
import { easeQuadInOut } from "d3-ease";
import { resolveEase } from "./ease";

// The curated ease names authored by the Blender addon (tools/blender/addon/bindings_model.py
// EASE_NAMES) must each resolve to a real d3-ease function, or resolveEase() silently falls
// back to linear and the bake diverges from the runtime.
const CURATED_EASE_NAMES = [
  "linear",
  "quadIn", "quadOut", "quadInOut",
  "cubicIn", "cubicOut", "cubicInOut",
  "sinIn", "sinOut", "sinInOut",
  "expIn", "expOut", "expInOut",
  "backOut",
];

test.each(CURATED_EASE_NAMES)("curated ease %s resolves to a real d3-ease fn", (name) => {
  const key = "ease" + name.charAt(0).toUpperCase() + name.slice(1);
  expect(typeof (d3ease as Record<string, unknown>)[key]).toBe("function");
});

describe("resolveEase", () => {
  it("returns a linear pass-through when name is undefined", () => {
    expect(resolveEase(undefined)(0.25)).toBe(0.25);
  });

  it("resolves a known d3-ease name", () => {
    expect(resolveEase("quadInOut")(0.3)).toBeCloseTo(easeQuadInOut(0.3), 10);
  });

  it("warns and falls back to linear on an unknown name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveEase("bogusEase")(0.42)).toBe(0.42);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});
