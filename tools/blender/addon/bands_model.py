import bpy


class BandConfig(bpy.types.PropertyGroup):
    name: bpy.props.StringProperty(name="Name", default="bass")
    stem_path: bpy.props.StringProperty(name="Stem", subtype="FILE_PATH")
    power: bpy.props.IntProperty(name="FFT Power", default=11, min=5, max=15)
    smoothing_time_constant: bpy.props.FloatProperty(
        name="Smoothing", default=0.8, min=0.0, max=1.0
    )
    min_frequency: bpy.props.IntProperty(name="Min Hz", default=20, min=0)
    max_frequency: bpy.props.IntProperty(name="Max Hz", default=16500, min=1)
    num_buckets: bpy.props.IntProperty(name="Buckets", default=8, min=1)
    fps: bpy.props.IntProperty(name="FPS", default=30, min=1)


def band_analyser_config(band):
    """The analyser config passed to the bake CLI (numBuckets/fps are separate args)."""
    return {
        "power": band.power,
        "smoothingTimeConstant": band.smoothing_time_constant,
        "minFrequency": band.min_frequency,
        "maxFrequency": band.max_frequency,
    }


class SOUNDSCAPE_UL_bands(bpy.types.UIList):
    def draw_item(self, context, layout, data, item, icon, active_data, active_propname, index):
        layout.label(text=item.name, icon="OUTLINER_OB_SPEAKER")


class SOUNDSCAPE_OT_band_add(bpy.types.Operator):
    bl_idname = "soundscape.band_add"
    bl_label = "Add Band"

    def execute(self, context):
        bands = context.scene.soundscape_bands
        bands.add()
        context.scene.soundscape_active_band = len(bands) - 1
        return {"FINISHED"}


class SOUNDSCAPE_OT_band_remove(bpy.types.Operator):
    bl_idname = "soundscape.band_remove"
    bl_label = "Remove Band"

    def execute(self, context):
        bands = context.scene.soundscape_bands
        i = context.scene.soundscape_active_band
        if 0 <= i < len(bands):
            bands.remove(i)
            context.scene.soundscape_active_band = max(0, i - 1)
        return {"FINISHED"}


class SOUNDSCAPE_PT_bands(bpy.types.Panel):
    bl_label = "Soundscape Bands"
    bl_idname = "SOUNDSCAPE_PT_bands"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "Soundscape"

    def draw(self, context):
        layout = self.layout
        scene = context.scene
        row = layout.row()
        row.template_list("SOUNDSCAPE_UL_bands", "", scene, "soundscape_bands",
                          scene, "soundscape_active_band")
        col = row.column(align=True)
        col.operator("soundscape.band_add", icon="ADD", text="")
        col.operator("soundscape.band_remove", icon="REMOVE", text="")

        i = scene.soundscape_active_band
        if 0 <= i < len(scene.soundscape_bands):
            band = scene.soundscape_bands[i]
            box = layout.box()
            for prop in ("name", "stem_path", "power", "smoothing_time_constant",
                         "min_frequency", "max_frequency", "num_buckets", "fps"):
                box.prop(band, prop)


_classes = (
    BandConfig,
    SOUNDSCAPE_UL_bands,
    SOUNDSCAPE_OT_band_add,
    SOUNDSCAPE_OT_band_remove,
    SOUNDSCAPE_PT_bands,
)


def register():
    for cls in _classes:
        bpy.utils.register_class(cls)
    bpy.types.Scene.soundscape_bands = bpy.props.CollectionProperty(type=BandConfig)
    bpy.types.Scene.soundscape_active_band = bpy.props.IntProperty(default=0)


def unregister():
    del bpy.types.Scene.soundscape_active_band
    del bpy.types.Scene.soundscape_bands
    for cls in reversed(_classes):
        bpy.utils.unregister_class(cls)
