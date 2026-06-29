import bpy


def build():
    """Empty scene with one single-material emissive cube carrying a single
    emissiveIntensity<-bass.volume binding. Single material => single glTF
    primitive => GLTFLoader yields a Mesh (not a Group)."""
    bpy.ops.wm.read_factory_settings(use_empty=True)

    bpy.ops.mesh.primitive_cube_add(size=1.0)
    obj = bpy.context.active_object
    obj.name = "reactive"

    mat = bpy.data.materials.new("emissive")
    mat.use_nodes = True
    obj.data.materials.append(mat)

    b = obj.soundscape_bindings.add()
    b.target_property = "emissiveIntensity"
    b.band = "bass"
    b.measure = "volume"
    b.out_min = 0.0
    b.out_max = 1.0
    b.exponent = 2.0
    b.ease = "cubicOut"
    b.use_smoothing = True
    b.smoothing_attack = 0.8
    b.smoothing_release = 0.2
    return obj
