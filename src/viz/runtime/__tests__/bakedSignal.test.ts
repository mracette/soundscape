import { describe, test, expect } from "vitest";
import { sampleFrames, combineStems, BakedSignalSource, type ActiveStem } from "../bakedSignal";
import type { BakeResult } from "../bake/bakeSignal";

/** 4 frames @ 2fps → 2s loop. Frame centers at 0.25, 0.75, 1.25, 1.75s. */
function bake(volumes: number[], fps = 2): BakeResult {
  return {
    fps,
    sampleRate: 44100,
    durationSec: volumes.length / fps,
    band: "test",
    frames: volumes.map((v, i) => ({ volume: v, buckets: [v, 1 - v], onset: i === 1 ? 1 : 0 })),
  };
}

describe("sampleFrames", () => {
  test("returns the exact frame at a frame center", () => {
    expect(sampleFrames(bake([0, 0.5, 1, 0.25]), 0.75).volume).toBeCloseTo(0.5, 10);
  });
  test("linearly interpolates between adjacent frame centers", () => {
    // midway between centers 0.25 (v=0) and 0.75 (v=0.5) → 0.25
    expect(sampleFrames(bake([0, 0.5, 1, 0.25]), 0.5).volume).toBeCloseTo(0.25, 10);
  });
  test("wraps: after the last center it interpolates toward frame 0", () => {
    // t=1.95: between center 1.75 (v=0.25) and wrapped center 2.25→0.25s (v=0), frac 0.4
    expect(sampleFrames(bake([0, 0.5, 1, 0.25]), 1.95).volume).toBeCloseTo(0.25 * 0.6, 10);
  });
  test("wraps before the first center toward the last frame", () => {
    // t=0.05: between wrapped center -0.25 (last frame, v=0.25) and 0.25 (v=0), frac 0.6
    expect(sampleFrames(bake([0, 0.5, 1, 0.25]), 0.05).volume).toBeCloseTo(0.25 * 0.4, 10);
  });
  test("interpolates buckets and onset the same way", () => {
    const f = sampleFrames(bake([0, 0.5, 1, 0.25]), 0.5);
    expect(f.buckets[0]).toBeCloseTo(0.25, 10);
    expect(f.onset).toBeCloseTo(0.5, 10); // onset 0 → 1 midway
  });
});

describe("combineStems", () => {
  test("weighted sum clamped to 1 per component", () => {
    const a = { frame: { volume: 0.8, buckets: [0.8], onset: 0.2 }, weight: 1 };
    const b = { frame: { volume: 0.6, buckets: [0.1], onset: 0.1 }, weight: 0.5 };
    const c = combineStems([a, b]);
    expect(c.volume).toBeCloseTo(1, 10);        // 0.8 + 0.3 clamped
    expect(c.buckets[0]).toBeCloseTo(0.85, 10); // 0.8 + 0.05
    expect(c.onset).toBeCloseTo(0.25, 10);
  });
  test("empty input yields silence", () => {
    const c = combineStems([]);
    expect(c.volume).toBe(0);
    expect(c.buckets).toEqual([]);
    expect(c.onset).toBe(0);
  });
  test("uneven bucket lengths: missing entries read 0", () => {
    const a = { frame: { volume: 0, buckets: [0.5, 0.5], onset: 0 }, weight: 1 };
    const b = { frame: { volume: 0, buckets: [0.25], onset: 0 }, weight: 1 };
    expect(combineStems([a, b]).buckets).toEqual([0.75, 0.5]);
  });
});

describe("BakedSignalSource", () => {
  function source(stems: Record<string, ActiveStem[]>) {
    const s = new BakedSignalSource(() => stems);
    s.update();
    return s;
  }
  test("reads volume/bucket/onset for a band", () => {
    const s = source({ bass: [{ bake: bake([1, 1, 1, 1]), positionSec: 0.25, weight: 1 }] });
    expect(s.read({ band: "bass", measure: "volume" })).toBeCloseTo(1, 10);
    expect(s.read({ band: "bass", measure: "bucket", bucket: 0 })).toBeCloseTo(1, 10);
    expect(s.read({ band: "bass", measure: "onset" })).toBeCloseTo(0, 10);
  });
  test("unknown band and out-of-range bucket read 0", () => {
    const s = source({});
    expect(s.read({ band: "nope", measure: "volume" })).toBe(0);
    const s2 = source({ bass: [{ bake: bake([1, 1, 1, 1]), positionSec: 0.25, weight: 1 }] });
    expect(s2.read({ band: "bass", measure: "bucket", bucket: 99 })).toBe(0);
  });
  test("weight 0 and negative position stems are excluded", () => {
    const s = source({ bass: [
      { bake: bake([1, 1, 1, 1]), positionSec: 0.25, weight: 0 },
      { bake: bake([1, 1, 1, 1]), positionSec: -0.5, weight: 1 },
    ] });
    expect(s.read({ band: "bass", measure: "volume" })).toBe(0);
  });
  test("read before update returns 0 (no stale throw)", () => {
    const s = new BakedSignalSource(() => ({}));
    expect(s.read({ band: "bass", measure: "volume" })).toBe(0);
  });
});
