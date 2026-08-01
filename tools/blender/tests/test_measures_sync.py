import os
import sys


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, os.path.join(here, ".."))  # tools/blender -> import addon
    import json
    from addon import bindings_model

    with open(os.path.join(here, "parity_vectors.json")) as fh:
        fixture = json.load(fh)
    ts_measures = fixture["measures"]

    assert len(ts_measures) >= 3, f"fixture measures suspiciously small: {ts_measures}"
    assert list(bindings_model.MEASURES) == list(ts_measures), (
        f"MEASURES drift: addon={bindings_model.MEASURES} ts={ts_measures}"
    )

    print("OK test_measures_sync")


try:
    main()
except Exception as exc:  # noqa: BLE001
    print("FAIL", repr(exc))
    sys.exit(1)
sys.exit(0)
