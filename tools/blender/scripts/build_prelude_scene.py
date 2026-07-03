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
    import mathutils
    import addon
    from addon import bindings_model

    OUT = os.path.join(
        HERE, "..", "..", "..", "public", "models", "prelude", "scene.glb"
    )
    OUT = os.path.abspath(OUT)

    def surface_material(name, base_color, emission_color=None, emission_strength=0.0):
        """Principled material with a distinct base color and, for reactive
        objects, a non-black emission so the emissiveIntensity binding is visible
        by construction (exporter writes a non-black emissiveFactor)."""
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes["Principled BSDF"]
        bsdf.inputs["Base Color"].default_value = (*base_color, 1.0)
        if emission_color is not None:
            bsdf.inputs["Emission Color"].default_value = (*emission_color, 1.0)
            bsdf.inputs["Emission Strength"].default_value = emission_strength
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
        ground.data.materials.append(
            surface_material("ground-mat", (0.10, 0.11, 0.16))
        )

        # bass-orb: emissive glow driven by bass volume. Emission strength 0.2
        # matches the binding's outMin so the rest state reads consistently.
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.8, location=(-2.5, 1.0, 0.0))
        orb = bpy.context.active_object
        orb.name = "bass-orb"
        orb.data.materials.append(
            surface_material(
                "bass-orb-mat",
                (0.90, 0.25, 0.10),
                emission_color=(1.0, 0.35, 0.10),
                emission_strength=0.2,
            )
        )
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
        column.data.materials.append(
            surface_material(
                "beat-column-mat",
                (0.15, 0.65, 0.35),
                emission_color=(0.20, 0.90, 0.45),
                emission_strength=0.2,
            )
        )
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
        ring.data.materials.append(
            surface_material(
                "keys-ring-mat",
                (0.45, 0.35, 0.85),
                emission_color=(0.55, 0.40, 1.0),
                emission_strength=0.2,
            )
        )
        add_binding(
            ring,
            target_property="scale",
            band="melody",
            measure="bucket",
            bucket=2,
            out_min=1.0,
            out_max=1.5,
            use_smoothing=True,
            smoothing_attack=0.85,
            smoothing_release=0.4,
        )

        # The three reactive objects sit around Blender (0, 1, 0); aim the camera
        # at that cluster from front-elevated so they lie along its -Z.
        target = mathutils.Vector((0.0, 1.0, 0.0))

        cam_data = bpy.data.cameras.new("Camera")
        cam = bpy.data.objects.new("Camera", cam_data)
        bpy.context.scene.collection.objects.link(cam)
        cam.location = (0.0, -9.0, 4.0)
        cam_dir = target - mathutils.Vector(cam.location)
        cam.rotation_euler = cam_dir.to_track_quat("-Z", "Y").to_euler()
        bpy.context.scene.camera = cam

        # Key light (Sun) angled down at the cluster, plus a dim fill so shaded
        # faces aren't pure black. export_lights=True ships KHR_lights_punctual,
        # which GLTFLoader turns back into three lights.
        sun_data = bpy.data.lights.new("Sun", type="SUN")
        sun_data.energy = 3.0
        sun = bpy.data.objects.new("Sun", sun_data)
        bpy.context.scene.collection.objects.link(sun)
        sun.location = (2.0, -4.0, 8.0)
        sun.rotation_euler = (
            (target - mathutils.Vector(sun.location)).to_track_quat("-Z", "Y").to_euler()
        )

        fill_data = bpy.data.lights.new("Fill", type="SUN")
        fill_data.energy = 1.0
        fill = bpy.data.objects.new("Fill", fill_data)
        bpy.context.scene.collection.objects.link(fill)
        fill.location = (-6.0, -3.0, 4.0)
        fill.rotation_euler = (
            (target - mathutils.Vector(fill.location))
            .to_track_quat("-Z", "Y")
            .to_euler()
        )

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
            export_lights=True,
            # Export sun energy 1:1 instead of the default watt->lumen (x683)
            # conversion; the runtime renders with NoToneMapping, where lux-scale
            # intensities clip straight to white.
            export_import_convert_lighting_mode="RAW",
        )
        print("WROTE", OUT)

    main()
except Exception as exc:  # noqa: BLE001
    print("FAIL", repr(exc))
    sys.exit(1)
sys.exit(0)
