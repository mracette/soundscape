import os
import sys


def main():
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

    import bpy
    from addon import preview_target as pt

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.mesh.primitive_cube_add()
    obj = bpy.context.active_object
    mat = bpy.data.materials.new("m")
    mat.use_nodes = True
    obj.data.materials.append(mat)

    # transform components
    for prop, idx, attr in [
        ("position.x", 0, "location"), ("position.y", 1, "location"), ("position.z", 2, "location"),
        ("rotation.x", 0, "rotation_euler"), ("rotation.y", 1, "rotation_euler"), ("rotation.z", 2, "rotation_euler"),
        ("scale.x", 0, "scale"), ("scale.y", 1, "scale"), ("scale.z", 2, "scale"),
    ]:
        pt.apply_target(obj, prop, 1.5)
        assert abs(getattr(obj, attr)[idx] - 1.5) < 1e-6, prop
        assert abs(pt.read_target(obj, prop) - 1.5) < 1e-6, f"read {prop}"

    # uniform scale
    pt.apply_target(obj, "scale", 2.0)
    assert all(abs(c - 2.0) < 1e-6 for c in obj.scale), "uniform scale"
    assert abs(pt.read_target(obj, "scale") - 2.0) < 1e-6, "read uniform scale"

    # material targets
    pt.apply_target(obj, "emissiveIntensity", 3.0)
    node = pt._principled(obj)
    assert abs(node.inputs["Emission Strength"].default_value - 3.0) < 1e-6, "emissive"
    assert abs(pt.read_target(obj, "emissiveIntensity") - 3.0) < 1e-6, "read emissive"
    pt.apply_target(obj, "opacity", 0.25)
    assert abs(node.inputs["Alpha"].default_value - 0.25) < 1e-6, "opacity"
    assert abs(pt.read_target(obj, "opacity") - 0.25) < 1e-6, "read opacity"

    # material target on an object with no Principled node is a safe no-op
    bpy.ops.mesh.primitive_cube_add()
    bare = bpy.context.active_object
    pt.apply_target(bare, "emissiveIntensity", 5.0)  # must not raise
    assert pt.read_target(bare, "emissiveIntensity") is None, "no-material read is None"

    print("OK test_preview_target")


try:
    main()
except Exception as exc:  # noqa: BLE001
    print("FAIL", repr(exc))
    sys.exit(1)
sys.exit(0)
