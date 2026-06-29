import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, test, expect } from "vitest";
import { resolveEase } from "../ease";

const FIXTURE = resolve("tools/blender/tests/parity_vectors.json");

// Sample points per ease name: endpoints, mid, and the over/undershoot region.
const TS_AT = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1];
const EASE_NAMES = [
  "linear",
  "quadIn", "quadOut", "quadInOut",
  "cubicIn", "cubicOut", "cubicInOut",
  "sinIn", "sinOut", "sinInOut",
  "expIn", "expOut", "expInOut",
  "backOut",
];

function buildEase() {
  const out: { name: string; t: number; expected: number }[] = [];
  for (const name of EASE_NAMES) {
    const fn = resolveEase(name);
    for (const t of TS_AT) out.push({ name, t, expected: fn(t) });
  }
  return out;
}

// buildEvaluator() is added in Task 2; until then the fixture has only `ease`.
function buildFixture() {
  return { ease: buildEase() };
}

describe("parity vectors", () => {
  test("committed fixture matches the TS implementation", () => {
    const computed = buildFixture();
    if (process.env.WRITE_PARITY) {
      writeFileSync(FIXTURE, JSON.stringify(computed, null, 2) + "\n");
    }
    const committed = JSON.parse(readFileSync(FIXTURE, "utf8"));
    // Round‑trip computed through JSON so the comparison is value‑for‑value.
    expect(JSON.parse(JSON.stringify(computed))).toEqual(committed);
  });
});
