import bpy

from . import bindings_model


def export_gltf(filepath):
    """Sync all objects' ID-props (sync_to_idprop removes stale props for
    unbound objects), then export the scene to a .glb with custom-property
    extras enabled so the bindings ride into node extras."""
    for obj in bpy.data.objects:
        bindings_model.sync_to_idprop(obj)
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format="GLB",
        export_extras=True,
    )
