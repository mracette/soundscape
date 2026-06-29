import os
import sys


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, os.path.join(here, ".."))  # tools/blender -> import addon
    import json
    from addon import evaluator

    with open(os.path.join(here, "parity_vectors.json")) as fh:
        cases = json.load(fh)["evaluator"]

    assert len(cases) >= 7, f"fixture too short: {len(cases)}"

    for case in cases:
        ev = evaluator.BindingEvaluator(case["binding"])
        for i, s in enumerate(case["signals"]):
            got = ev.evaluate(s)
            want = case["expected"][i]
            assert abs(got - want) < 1e-9, (
                f"{case['label']} step {i} signal={s}: py={got!r} ts={want!r}"
            )

    # NaN parity (JSON can't carry NaN): clamp01(NaN) -> 0 -> lerp -> outMin.
    minimal = {
        "target": {"property": "emissiveIntensity"},
        "source": {"band": "b", "measure": "volume"},
        "transform": {"outMin": 0.0, "outMax": 1.0},
    }
    assert evaluator.BindingEvaluator(minimal).evaluate(float("nan")) == 0.0

    print(f"OK test_parity_evaluator ({len(cases)} cases)")


try:
    main()
except Exception as exc:  # noqa: BLE001
    print("FAIL", repr(exc))
    sys.exit(1)
sys.exit(0)
