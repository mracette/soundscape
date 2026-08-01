from .ease import resolve_ease


def _clamp(v, lo, hi):
    return lo if v < lo else (hi if v > hi else v)


def _clamp01(v):
    # NaN-safe: mirrors evaluator.ts clamp01 (v > 0 ? (v < 1 ? v : 1) : 0).
    # A non-finite signal (e.g. an empty bucket's 0/0) maps to 0.
    if v > 0:
        return v if v < 1 else 1
    return 0


class BindingEvaluator:
    """Mirror of src/viz/runtime/evaluator.ts. One instance per binding; holds the
    attack/release envelope as state. Call evaluate(signal) with the 0..1 level."""

    def __init__(self, binding, ease=None):
        self.binding = binding
        self.smoothed = 0
        transform = binding["transform"]
        self.ease = ease if ease is not None else resolve_ease(transform.get("ease"))

    def evaluate(self, signal):
        t = self.binding["transform"]
        s = _clamp01(signal)

        # Gate-then-rescale before the envelope, mirroring evaluator.ts: below
        # the threshold is exactly 0; the surviving range remaps to 0..1.
        gate = t.get("gate")
        if gate is not None:
            s = max(0, s - gate) / (1 - gate)

        smoothing = t.get("smoothing")
        if smoothing is not None:
            coef = smoothing["attack"] if s > self.smoothed else smoothing["release"]
            self.smoothed += (s - self.smoothed) * coef
            s = self.smoothed

        exponent = t.get("exponent")
        if exponent is not None:
            s = s ** exponent

        s = self.ease(s)

        out = t["outMin"] + (t["outMax"] - t["outMin"]) * s
        return _clamp(out, min(t["outMin"], t["outMax"]), max(t["outMin"], t["outMax"]))
