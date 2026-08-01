import os
import sys


def main():
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

    import bpy
    import addon
    from addon import bindings_model

    addon.register()

    for name in (
        "SOUNDSCAPE_PT_panel",
        "SOUNDSCAPE_UL_bindings",
        "SOUNDSCAPE_OT_binding_add",
        "SOUNDSCAPE_OT_binding_remove",
    ):
        assert hasattr(bpy.types, name), f"{name} not registered"

    # the model still works through the full package register
    mesh = bpy.data.meshes.new("M")
    obj = bpy.data.objects.new("o", mesh)
    bpy.context.collection.objects.link(obj)
    b = obj.soundscape_bindings.add()
    b.band = "rhythm"
    bindings_model.sync_to_idprop(obj)
    assert obj["soundscape"].to_dict()["bindings"][0]["source"]["band"] == "rhythm"

    addon.unregister()
    for name in (
        "SOUNDSCAPE_PT_panel",
        "SOUNDSCAPE_UL_bindings",
        "SOUNDSCAPE_OT_binding_add",
        "SOUNDSCAPE_OT_binding_remove",
    ):
        assert not hasattr(bpy.types, name), f"{name} still registered after unregister"

    print("OK test_register")


try:
    main()
except Exception as exc:  # noqa: BLE001
    print("FAIL", repr(exc))
    sys.exit(1)
sys.exit(0)
