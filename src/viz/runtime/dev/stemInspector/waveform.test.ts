import { describe, it, expect } from "vitest";
import { peakColumns } from "./waveform";

describe("peakColumns", () => {
  it("returns per-column min/max over even chunks", () => {
    const s = new Float32Array([0.1, -0.5, 0.9, 0.2, -0.8, 0.3]);
    const result = peakColumns(s, 2);
    expect(result).toHaveLength(2);
    expect(result[0].min).toBeCloseTo(-0.5, 5);
    expect(result[0].max).toBeCloseTo(0.9, 5);
    expect(result[1].min).toBeCloseTo(-0.8, 5);
    expect(result[1].max).toBeCloseTo(0.3, 5);
  });

  it("always returns exactly `columns` entries, zero-filled when short", () => {
    const cols = peakColumns(new Float32Array([0.5]), 4);
    expect(cols.length).toBe(4);
    expect(cols[0]).toEqual({ min: 0, max: 0.5 });
    expect(cols[3]).toEqual({ min: 0, max: 0 });
  });

  it("handles empty input", () => {
    expect(peakColumns(new Float32Array(0), 3)).toEqual([
      { min: 0, max: 0 },
      { min: 0, max: 0 },
      { min: 0, max: 0 },
    ]);
  });
});
