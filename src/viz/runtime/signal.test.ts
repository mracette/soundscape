import { describe, it, expect } from "vitest";
import { AnalyserSignalSource, type AnalyserLike } from "./signal";

function fakeBand(fft: number[], buckets: number[]): AnalyserLike {
  return {
    getFrequencyData() {},
    getFrequencyBuckets() {},
    fftData: Uint8Array.from(fft),
    bucketData: buckets,
  };
}

describe("AnalyserSignalSource", () => {
  it("returns the mean normalized level for measure 'volume'", () => {
    const src = new AnalyserSignalSource({ bass: fakeBand([255, 0, 255, 0], []) });
    expect(src.read({ band: "bass", measure: "volume" })).toBeCloseTo(0.5, 10);
  });

  it("returns the normalized bucket for measure 'bucket'", () => {
    const src = new AnalyserSignalSource({ rhythm: fakeBand([], [0, 51, 0]) });
    expect(src.read({ band: "rhythm", measure: "bucket", bucket: 1 })).toBeCloseTo(0.2, 10);
  });

  it("returns 0 for an unknown band", () => {
    expect(new AnalyserSignalSource({}).read({ band: "ghost", measure: "volume" })).toBe(0);
  });

  it("returns 0 for an out-of-range bucket", () => {
    const src = new AnalyserSignalSource({ rhythm: fakeBand([], [10]) });
    expect(src.read({ band: "rhythm", measure: "bucket", bucket: 9 })).toBe(0);
  });

  it("returns 0 for a NaN bucket value", () => {
    const src = new AnalyserSignalSource({ rhythm: fakeBand([], [NaN]) });
    expect(src.read({ band: "rhythm", measure: "bucket", bucket: 0 })).toBe(0);
  });

  it("returns 0 for an empty fft (volume)", () => {
    const src = new AnalyserSignalSource({ bass: fakeBand([], []) });
    expect(src.read({ band: "bass", measure: "volume" })).toBe(0);
  });

  it("update() refreshes every band's analyser", () => {
    let calls = 0;
    const band: AnalyserLike = {
      getFrequencyData() { calls++; },
      getFrequencyBuckets() { calls++; },
      fftData: Uint8Array.of(0),
      bucketData: [0],
    };
    new AnalyserSignalSource({ a: band, b: band }).update();
    expect(calls).toBe(4);
  });
});
