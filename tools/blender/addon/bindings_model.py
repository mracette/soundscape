import bpy

TARGET_PROPERTIES = [
    "emissiveIntensity",
    "opacity",
    "scale",
    "scale.x",
    "scale.y",
    "scale.z",
    "rotation.x",
    "rotation.y",
    "rotation.z",
    "position.x",
    "position.y",
    "position.z",
]

MEASURES = ["volume", "bucket"]

# Curated d3-ease short names the runtime's resolveEase() understands.
# Each entry must resolve to a real d3-ease export (easeXxx); guarded by the
# curated-ease test in src/viz/runtime/ease.test.ts.
EASE_NAMES = [
    "linear",
    "quadIn",
    "quadOut",
    "quadInOut",
    "cubicIn",
    "cubicOut",
    "cubicInOut",
    "sinIn",
    "sinOut",
    "sinInOut",
    "expIn",
    "expOut",
    "expInOut",
    "backOut",
]


def _items(names):
    return [(n, n, "") for n in names]


class BindingPropertyGroup(bpy.types.PropertyGroup):
    target_property: bpy.props.EnumProperty(
        name="Target", items=_items(TARGET_PROPERTIES), default="emissiveIntensity"
    )
    band: bpy.props.StringProperty(name="Band", default="bass")
    measure: bpy.props.EnumProperty(
        name="Measure", items=_items(MEASURES), default="volume"
    )
    bucket: bpy.props.IntProperty(name="Bucket", default=0, min=0)
    out_min: bpy.props.FloatProperty(name="Out Min", default=0.0)
    out_max: bpy.props.FloatProperty(name="Out Max", default=1.0)
    exponent: bpy.props.FloatProperty(name="Exponent", default=1.0, min=0.0001)
    ease: bpy.props.EnumProperty(
        name="Ease", items=_items(EASE_NAMES), default="linear"
    )
    use_smoothing: bpy.props.BoolProperty(name="Use Smoothing", default=False)
    smoothing_attack: bpy.props.FloatProperty(
        name="Attack", default=0.5, min=0.0, max=1.0
    )
    smoothing_release: bpy.props.FloatProperty(
        name="Release", default=0.5, min=0.0, max=1.0
    )


def binding_to_dict(b):
    d = {
        "target": {"property": b.target_property},
        "source": {"band": b.band, "measure": b.measure},
        "transform": {"outMin": b.out_min, "outMax": b.out_max},
    }
    if b.measure == "bucket":
        d["source"]["bucket"] = b.bucket
    if b.exponent != 1.0:
        d["transform"]["exponent"] = b.exponent
    if b.ease != "linear":
        d["transform"]["ease"] = b.ease
    if b.use_smoothing:
        d["transform"]["smoothing"] = {
            "attack": b.smoothing_attack,
            "release": b.smoothing_release,
        }
    return d


def sync_to_idprop(obj):
    """Write the object's bindings to obj["soundscape"] as a nested ID-property
    matching binding.schema.json, or remove it when there are no bindings."""
    if len(obj.soundscape_bindings) == 0:
        if "soundscape" in obj:
            del obj["soundscape"]
        return
    obj["soundscape"] = {
        "bindings": [binding_to_dict(b) for b in obj.soundscape_bindings]
    }


def register():
    bpy.utils.register_class(BindingPropertyGroup)
    bpy.types.Object.soundscape_bindings = bpy.props.CollectionProperty(
        type=BindingPropertyGroup
    )
    bpy.types.Object.soundscape_active_binding = bpy.props.IntProperty(default=0)


def unregister():
    del bpy.types.Object.soundscape_active_binding
    del bpy.types.Object.soundscape_bindings
    bpy.utils.unregister_class(BindingPropertyGroup)
