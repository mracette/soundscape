import bpy

from . import bindings_model


def export_gltf(filepath):
    """Sync every bound object's ID-prop, then export the scene to a .glb with
    custom-property extras enabled so the bindings ride into node extras."""
    for obj in bpy.data.objects:
        if len(obj.soundscape_bindings) > 0:
            bindings_model.sync_to_idprop(obj)
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format="GLB",
        export_extras=True,
    )
