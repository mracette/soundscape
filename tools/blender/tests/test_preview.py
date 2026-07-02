import os
import sys


def main():
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

    import bpy
    import addon
    from addon import preview, evaluator, bindings_model

    addon.register()

    for name in ("SOUNDSCAPE_PT_preview", "SOUNDSCAPE_OT_preview", "SOUNDSCAPE_OT_bake_bands"):
        assert hasattr(bpy.types, name), f"{name} not registered"

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.mesh.primitive_cube_add()
    obj = bpy.context.active_object
    mat = bpy.data.materials.new("m")
    mat.use_nodes = True
    obj.data.materials.append(mat)

    b = obj.soundscape_bindings.add()
    b.target_property = "emissiveIntensity"
    b.band = "bass"
    b.measure = "volume"
    b.out_min = 0.0
    b.out_max = 4.0
    b.use_smoothing = True
    b.smoothing_attack = 0.8
    b.smoothing_release = 0.2

    items = preview.build_preview_items([obj])
    assert len(items) == 1 and items[0]["band"] == "bass"

    bakes = {"bass": {"frames": [
        {"volume": 0.0, "buckets": []},
        {"volume": 1.0, "buckets": []},
        {"volume": 1.0, "buckets": []},
    ]}}

    # snapshot BEFORE preview; apply_frame must move the property; restore brings it back
    snap = preview.snapshot_items(items)

    # Frame values must match a reference BindingEvaluator fed the same signals.
    ref = evaluator.BindingEvaluator(bindings_model.binding_to_dict(b))
    from addon import preview_target as pt
    for f, sig in [(0, 0.0), (1, 1.0), (2, 1.0)]:
        preview.apply_frame(items, bakes, f)
        expected = ref.evaluate(sig)
        got = pt.read_target(obj, "emissiveIntensity")
        # 1e-6: apply_target writes through a Blender single-precision RNA float, so
        # the read-back loses precision vs the double-precision reference evaluator.
        assert abs(got - expected) < 1e-6, f"frame {f}: got {got} expected {expected}"

    preview.restore_snapshot(snap)
    assert abs(pt.read_target(obj, "emissiveIntensity") - snap[0][2]) < 1e-9, "restore"

    # read_signal: bucket measure and out-of-range frame clamp
    assert preview.read_signal({"frames": [{"volume": 0.3, "buckets": [0.9]}]}, "bucket", 0, 0) == 0.9
    assert preview.read_signal({"frames": [{"volume": 0.3, "buckets": [0.9]}]}, "volume", 0, 99) == 0.3

    # read_signal: onset measure reads the key when present, and defaults to 0.0
    # for stale bakes made before the onset feature (no KeyError)
    assert preview.read_signal({"frames": [{"volume": 0.3, "buckets": [], "onset": 0.7}]}, "onset", 0, 0) == 0.7
    assert preview.read_signal({"frames": [{"volume": 0.3, "buckets": []}]}, "onset", 0, 0) == 0.0

    # non-uniform base scale must round-trip exactly through snapshot/apply_frame/restore,
    # not collapse to the uniform scale apply_target writes while previewing
    bpy.ops.mesh.primitive_cube_add()
    scale_obj = bpy.context.active_object
    scale_obj.scale = (1.0, 0.4, 2.0)
    sb = scale_obj.soundscape_bindings.add()
    sb.target_property = "scale"
    sb.band = "bass"
    sb.measure = "volume"
    sb.out_min = 0.0
    sb.out_max = 4.0

    scale_items = preview.build_preview_items([scale_obj])
    scale_snap = preview.snapshot_items(scale_items)
    preview.apply_frame(scale_items, bakes, 1)
    assert scale_obj.scale[0] == scale_obj.scale[1] == scale_obj.scale[2], "apply_frame should set scale uniformly"
    preview.restore_snapshot(scale_snap)
    for got, expected in zip(scale_obj.scale, (1.0, 0.4, 2.0)):
        assert abs(got - expected) < 1e-6, f"non-uniform scale restore: got {tuple(scale_obj.scale)}"

    # opacity applies the Alpha socket and makes the material's render method alpha-capable
    pt.apply_target(obj, "opacity", 0.25)
    assert obj.active_material.surface_render_method == "BLENDED", "opacity should enable BLENDED for viewport visibility"

    addon.unregister()
    print("OK test_preview")


try:
    main()
except Exception as exc:  # noqa: BLE001
    print("FAIL", repr(exc))
    sys.exit(1)
sys.exit(0)
