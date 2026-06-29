import os
import sys


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, os.path.join(here, ".."))  # tools/blender -> import addon
    import json
    from addon import ease

    with open(os.path.join(here, "parity_vectors.json")) as fh:
        vectors = json.load(fh)["ease"]

    assert len(vectors) >= 98, f"fixture too short: {len(vectors)}"

    for v in vectors:
        got = ease.resolve_ease(v["name"])(v["t"])
        assert abs(got - v["expected"]) < 1e-9, (
            f"{v['name']}({v['t']}): py={got!r} ts={v['expected']!r}"
        )

    # an unknown name resolves to linear, not an error
    assert ease.resolve_ease("nope")(0.42) == 0.42

    print(f"OK test_parity_ease ({len(vectors)} vectors)")


try:
    main()
except Exception as exc:  # noqa: BLE001
    print("FAIL", repr(exc))
    sys.exit(1)
sys.exit(0)
