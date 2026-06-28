import { describe, it, expect, vi } from "vitest";
import { easeQuadInOut } from "d3-ease";
import { resolveEase } from "./ease";

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
