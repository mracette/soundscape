import os
import sys


def main():
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

    import bpy
    from addon import bindings_model

    bindings_model.register()

    mesh = bpy.data.meshes.new("M")
    obj = bpy.data.objects.new("reactive", mesh)
    bpy.context.collection.objects.link(obj)

    b = obj.soundscape_bindings.add()
    b.target_property = "emissiveIntensity"
    b.band = "bass"
    b.measure = "volume"
    b.out_min = 0.0
    b.out_max = 1.0

    bindings_model.sync_to_idprop(obj)
    got = obj["soundscape"].to_dict()
    expected = {
        "bindings": [
            {
                "target": {"property": "emissiveIntensity"},
                "source": {"band": "bass", "measure": "volume"},
                "transform": {"outMin": 0.0, "outMax": 1.0},
            }
        ]
    }
    assert got == expected, f"minimal: {got!r}"

    # optional fields appear only when set
    b.measure = "bucket"
    b.bucket = 3
    b.exponent = 2.0
    b.ease = "cubicOut"
    b.use_smoothing = True
    b.smoothing_attack = 0.8
    b.smoothing_release = 0.2
    bindings_model.sync_to_idprop(obj)
    one = obj["soundscape"].to_dict()["bindings"][0]
    assert one["source"]["bucket"] == 3, one
    assert abs(one["transform"]["exponent"] - 2.0) < 1e-6, one
    assert one["transform"]["ease"] == "cubicOut", one
    assert abs(one["transform"]["smoothing"]["attack"] - 0.8) < 1e-6, one
    assert abs(one["transform"]["smoothing"]["release"] - 0.2) < 1e-6, one

    # bucket must NOT leak back when measure returns to volume
    b.measure = "volume"
    b.exponent = 1.0
    b.ease = "linear"
    b.use_smoothing = False
    bindings_model.sync_to_idprop(obj)
    back = obj["soundscape"].to_dict()["bindings"][0]
    assert "bucket" not in back["source"], back
    assert "exponent" not in back["transform"], back
    assert "ease" not in back["transform"], back
    assert "smoothing" not in back["transform"], back

    # clearing all bindings removes the ID-prop
    obj.soundscape_bindings.clear()
    bindings_model.sync_to_idprop(obj)
    assert "soundscape" not in obj, "expected idprop removed when no bindings"

    print("OK test_sync_to_idprop")


try:
    main()
except Exception as exc:  # noqa: BLE001
    print("FAIL", repr(exc))
    sys.exit(1)
sys.exit(0)
