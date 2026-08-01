import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, test, expect } from "vitest";
import { resolveEase } from "../ease";
import { BindingEvaluator } from "../evaluator";
import { MEASURE_VALUES } from "../../../bindings";

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

// Binding configs covering each pipeline branch; signals exercise rise (attack),
// fall (release), steady state, and clamp behavior.
const EVAL_CASES = [
  { label: "minimal", binding: { target: { property: "emissiveIntensity" }, source: { band: "b", measure: "volume" }, transform: { outMin: 0, outMax: 1 } } },
  { label: "exponent", binding: { target: { property: "scale" }, source: { band: "b", measure: "volume" }, transform: { outMin: 0, outMax: 1, exponent: 2 } } },
  { label: "ease-cubicOut", binding: { target: { property: "scale" }, source: { band: "b", measure: "volume" }, transform: { outMin: 0, outMax: 1, ease: "cubicOut" } } },
  { label: "ease-backOut-clamped", binding: { target: { property: "scale" }, source: { band: "b", measure: "volume" }, transform: { outMin: 0, outMax: 1, ease: "backOut" } } },
  { label: "smoothing", binding: { target: { property: "opacity" }, source: { band: "b", measure: "volume" }, transform: { outMin: 0, outMax: 1, smoothing: { attack: 0.8, release: 0.2 } } } },
  { label: "inverted-range", binding: { target: { property: "position.y" }, source: { band: "b", measure: "volume" }, transform: { outMin: 1, outMax: 0 } } },
  { label: "gate", binding: { target: { property: "emissiveIntensity" }, source: { band: "b", measure: "volume" }, transform: { outMin: 0, outMax: 1, gate: 0.25 } } },
  { label: "gate-smoothing", binding: { target: { property: "emissiveIntensity" }, source: { band: "b", measure: "volume" }, transform: { outMin: 0, outMax: 1, gate: 0.4, smoothing: { attack: 0.9, release: 0.25 } } } },
  { label: "combined", binding: { target: { property: "position.y" }, source: { band: "b", measure: "volume" }, transform: { outMin: -2, outMax: 3, gate: 0.1, exponent: 1.5, ease: "quadInOut", smoothing: { attack: 0.6, release: 0.3 } } } },
];
const SIGNALS = [0, 0.5, 1, 1, 0.3, 0, 0];

function buildEvaluator() {
  return EVAL_CASES.map(({ label, binding }) => {
    const ev = new BindingEvaluator(binding as never);
    const expected = SIGNALS.map((s) => ev.evaluate(s));
    return { label, binding, signals: SIGNALS, expected };
  });
}

function buildFixture() {
  return { measures: [...MEASURE_VALUES], ease: buildEase(), evaluator: buildEvaluator() };
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

  test("clamp01 maps a non-finite signal to 0 (NaN parity)", () => {
    const ev = new BindingEvaluator({ target: { property: "emissiveIntensity" }, source: { band: "b", measure: "volume" }, transform: { outMin: 0, outMax: 1 } } as never);
    expect(ev.evaluate(NaN)).toBe(0);
  });
});
