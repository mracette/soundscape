import type { Binding } from "../../bindings";
import { resolveEase, type EaseFn } from "./ease";

const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;
const clamp01 = (v: number): number => clamp(v, 0, 1);

/**
 * Evaluates one binding's transform each frame, holding the attack/release
 * smoothing envelope as internal state. Construct one per binding; call
 * `evaluate(signal)` with the source band's current 0..1 level.
 */
export class BindingEvaluator {
  private smoothed = 0;
  private readonly ease: EaseFn;

  constructor(
    private readonly binding: Binding,
    ease: EaseFn = resolveEase(binding.transform.ease)
  ) {
    this.ease = ease;
  }

  /**
   * Map a raw 0..1 signal to the target's output value. Pipeline: clamp to
   * [0,1] → attack/release envelope (when configured) → `^exponent` → ease →
   * lerp into [outMin, outMax] → clamp to that range.
   */
  evaluate(signal: number): number {
    const t = this.binding.transform;
    let s = clamp01(signal);

    if (t.smoothing) {
      const coef = s > this.smoothed ? t.smoothing.attack : t.smoothing.release;
      this.smoothed += (s - this.smoothed) * coef;
      s = this.smoothed;
    }

    if (t.exponent !== undefined) s = Math.pow(s, t.exponent);
    s = this.ease(s);

    const out = t.outMin + (t.outMax - t.outMin) * s;
    return clamp(out, Math.min(t.outMin, t.outMax), Math.max(t.outMin, t.outMax));
  }
}
