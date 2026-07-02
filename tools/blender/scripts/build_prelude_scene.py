"""Author the prelude starter scene headlessly and export it to a committed GLB.

Run:
  /Applications/Blender.app/Contents/MacOS/Blender --background \
    --python tools/blender/scripts/build_prelude_scene.py

Builds a ground plane plus three single-material, emissive-capable meshes, each
carrying one binding authored through the addon's CollectionProperty API (the
same path the Blender UI writes), then syncs the bindings to glTF extras and
exports to public/models/prelude/scene.glb. Single material per object keeps
each object a single glTF primitive, so GLTFLoader yields a Mesh (not a Group)
and the bindings ride on node extras the runtime reads.
"""

import os
import sys

try:
    HERE = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, os.path.join(HERE, ".."))  # tools/blender -> import addon

    import bpy
    import addon
    from addon import bindings_model

    OUT = os.path.join(
        HERE, "..", "..", "..", "public", "models", "prelude", "scene.glb"
    )
    OUT = os.path.abspath(OUT)

    def emissive_material(name):
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True
        return mat

    def add_binding(obj, **kwargs):
        b = obj.soundscape_bindings.add()
        for key, value in kwargs.items():
            setattr(b, key, value)
        return b

    def build():
        bpy.ops.wm.read_factory_settings(use_empty=True)

        # Ground plane (unbound), one material.
        bpy.ops.mesh.primitive_plane_add(size=12.0, location=(0.0, 0.0, 0.0))
        ground = bpy.context.active_object
        ground.name = "ground"
        ground.data.materials.append(emissive_material("ground-mat"))

        # bass-orb: emissive glow driven by bass volume.
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.8, location=(-2.5, 1.0, 0.0))
        orb = bpy.context.active_object
        orb.name = "bass-orb"
        orb.data.materials.append(emissive_material("bass-orb-mat"))
        add_binding(
            orb,
            target_property="emissiveIntensity",
            band="bass",
            measure="volume",
            out_min=0.2,
            out_max=6.0,
            use_smoothing=True,
            smoothing_attack=0.9,
            smoothing_release=0.35,
        )

        # beat-column: vertical scale pumped by rhythm onsets.
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 1.0, 0.0))
        column = bpy.context.active_object
        column.name = "beat-column"
        column.data.materials.append(emissive_material("beat-column-mat"))
        add_binding(
            column,
            target_property="scale.y",
            band="rhythm",
            measure="onset",
            out_min=1.0,
            out_max=2.2,
            gate=0.1,
        )

        # keys-ring: spins with a melody frequency bucket.
        bpy.ops.mesh.primitive_torus_add(
            major_radius=0.9, minor_radius=0.25, location=(2.5, 1.0, 0.0)
        )
        ring = bpy.context.active_object
        ring.name = "keys-ring"
        ring.data.materials.append(emissive_material("keys-ring-mat"))
        add_binding(
            ring,
            target_property="rotation.y",
            band="melody",
            measure="bucket",
            bucket=2,
            out_min=0.0,
            out_max=6.283,
        )

        # Camera framing the origin, exported with the scene.
        cam_data = bpy.data.cameras.new("Camera")
        cam = bpy.data.objects.new("Camera", cam_data)
        bpy.context.scene.collection.objects.link(cam)
        cam.location = (0.0, 2.5, 9.0)
        cam.rotation_euler = (1.3, 0.0, 0.0)
        bpy.context.scene.camera = cam

    def main():
        addon.register()
        build()
        for obj in bpy.data.objects:
            bindings_model.sync_to_idprop(obj)
        os.makedirs(os.path.dirname(OUT), exist_ok=True)
        # Export directly (not addon.export.export_gltf) so cameras ride along;
        # export_extras carries the synced bindings into node extras.
        bpy.ops.export_scene.gltf(
            filepath=OUT,
            export_format="GLB",
            export_extras=True,
            export_cameras=True,
        )
        print("WROTE", OUT)

    main()
except Exception as exc:  # noqa: BLE001
    print("FAIL", repr(exc))
    sys.exit(1)
sys.exit(0)
