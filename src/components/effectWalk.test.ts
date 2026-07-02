import { describe, it, expect, afterEach, vi } from "vitest";
import { chooseNewValue } from "./effectWalk";

// The background-mode safe zones from EffectsPanel: hp walks 1..HP_WALK_CEIL,
// lp walks LP_WALK_FLOOR..100.
const HP_WALK_CEIL = 72;
const LP_WALK_FLOOR = 55;

/** Pin Math.random to a repeating sequence for deterministic walks. */
const seedRandom = (sequence: number[]) => {
  let i = 0;
  vi.spyOn(Math, "random").mockImplementation(
    () => sequence[i++ % sequence.length]
  );
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("chooseNewValue", () => {
  describe("full 1-100 range (original tuned constants: bounds 35, step 40)", () => {
    it("walks upward from the low band (prev < 36)", () => {
      seedRandom([0.5]);
      expect(chooseNewValue(10)).toBeCloseTo(10 + 0.5 * 40, 10);
    });

    it("walks downward from the high band (prev > 65)", () => {
      seedRandom([0.5]);
      expect(chooseNewValue(90)).toBeCloseTo(90 - 0.5 * 40, 10);
    });

    it("wanders gently in the middle band, centered on zero movement", () => {
      seedRandom([0.5]);
      expect(chooseNewValue(50)).toBeCloseTo(50, 10);
      seedRandom([0.75]);
      expect(chooseNewValue(50)).toBeCloseTo(60, 10);
      seedRandom([0.25]);
      expect(chooseNewValue(50)).toBeCloseTo(40, 10);
    });

    it("switches branches exactly at min+35 and max-35", () => {
      // at r=0.5 the low branch moves +20 while the middle branch holds still
      seedRandom([0.5]);
      expect(chooseNewValue(35.9)).toBeCloseTo(55.9, 10); // low branch
      seedRandom([0.5]);
      expect(chooseNewValue(36)).toBeCloseTo(36, 10); // middle branch
      seedRandom([0.5]);
      expect(chooseNewValue(65)).toBeCloseTo(65, 10); // middle branch
      seedRandom([0.5]);
      expect(chooseNewValue(65.1)).toBeCloseTo(45.1, 10); // high branch
    });

    it("clamps the result into the range", () => {
      seedRandom([0]);
      expect(chooseNewValue(110)).toBe(100);
      expect(chooseNewValue(-10)).toBe(1);
    });
  });

  describe("narrowed safe-zone ranges (margins scale as fractions of the range)", () => {
    it("scales the step to the range: low-branch move in 55-100 is (40/99)*45", () => {
      seedRandom([0.5]);
      expect(chooseNewValue(60, LP_WALK_FLOOR, 100)).toBeCloseTo(
        60 + ((40 / 99) * 45) / 2,
        10
      );
    });

    it("keeps the gentle middle branch reachable in a narrow range", () => {
      // With the old fixed bounds (35), min+35=90 > max-35=65 and the middle
      // branch was unreachable in 55-100 — the walk just ratcheted between the
      // edges. Scaled bounds put the middle band at ~70.9..84.1.
      seedRandom([0.5]);
      expect(chooseNewValue(77, LP_WALK_FLOOR, 100)).toBeCloseTo(77, 10); // zero step = middle branch
    });

    const wanderSequence = [
      0.13, 0.87, 0.42, 0.61, 0.29, 0.74, 0.05, 0.96, 0.5, 0.33, 0.68, 0.21,
      0.79, 0.47, 0.58, 0.09, 0.91, 0.36, 0.64, 0.25,
    ];

    it.each([
      ["hp", 1, HP_WALK_CEIL, 36],
      ["lp", LP_WALK_FLOOR, 100, 78],
    ])(
      "the %s walk stays interior and varies instead of ratcheting to a bound",
      (_label, min, max, start) => {
        seedRandom(wanderSequence);
        const values: number[] = [];
        let value = start;
        for (let step = 0; step < 20; step++) {
          value = chooseNewValue(value, min, max);
          values.push(value);
        }
        // never escapes or pins to the range edges
        for (const v of values) {
          expect(v).toBeGreaterThan(min);
          expect(v).toBeLessThan(max);
        }
        // moves in both directions and keeps finding new values
        const deltas = values.map((v, idx) => v - (idx === 0 ? start : values[idx - 1]));
        expect(deltas.some((d) => d > 0)).toBe(true);
        expect(deltas.some((d) => d < 0)).toBe(true);
        expect(new Set(values.map((v) => v.toFixed(3))).size).toBeGreaterThan(10);
      }
    );
  });
});
