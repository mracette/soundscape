import bpy

from . import bindings_model


class SOUNDSCAPE_UL_bindings(bpy.types.UIList):
    def draw_item(
        self, context, layout, data, item, icon, active_data, active_propname, index
    ):
        layout.label(text=f"{item.target_property} ← {item.band}.{item.measure}")


class SOUNDSCAPE_OT_binding_add(bpy.types.Operator):
    bl_idname = "soundscape.binding_add"
    bl_label = "Add Binding"

    def execute(self, context):
        obj = context.object
        obj.soundscape_bindings.add()
        obj.soundscape_active_binding = len(obj.soundscape_bindings) - 1
        bindings_model.sync_to_idprop(obj)
        return {"FINISHED"}


class SOUNDSCAPE_OT_binding_remove(bpy.types.Operator):
    bl_idname = "soundscape.binding_remove"
    bl_label = "Remove Binding"

    def execute(self, context):
        obj = context.object
        i = obj.soundscape_active_binding
        if 0 <= i < len(obj.soundscape_bindings):
            obj.soundscape_bindings.remove(i)
            obj.soundscape_active_binding = max(0, i - 1)
            bindings_model.sync_to_idprop(obj)
        return {"FINISHED"}


class SOUNDSCAPE_PT_panel(bpy.types.Panel):
    bl_label = "Soundscape Bindings"
    bl_idname = "SOUNDSCAPE_PT_panel"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "Soundscape"

    @classmethod
    def poll(cls, context):
        return context.object is not None

    def draw(self, context):
        layout = self.layout
        obj = context.object

        row = layout.row()
        row.template_list(
            "SOUNDSCAPE_UL_bindings",
            "",
            obj,
            "soundscape_bindings",
            obj,
            "soundscape_active_binding",
        )
        col = row.column(align=True)
        col.operator("soundscape.binding_add", icon="ADD", text="")
        col.operator("soundscape.binding_remove", icon="REMOVE", text="")

        i = obj.soundscape_active_binding
        if 0 <= i < len(obj.soundscape_bindings):
            b = obj.soundscape_bindings[i]
            box = layout.box()
            box.prop(b, "target_property")
            box.prop(b, "band")
            box.prop(b, "measure")
            if b.measure == "bucket":
                box.prop(b, "bucket")
            box.prop(b, "out_min")
            box.prop(b, "out_max")
            box.prop(b, "exponent")
            box.prop(b, "ease")
            box.prop(b, "use_smoothing")
            if b.use_smoothing:
                box.prop(b, "smoothing_attack")
                box.prop(b, "smoothing_release")


_classes = (
    SOUNDSCAPE_UL_bindings,
    SOUNDSCAPE_OT_binding_add,
    SOUNDSCAPE_OT_binding_remove,
    SOUNDSCAPE_PT_panel,
)


def register():
    for cls in _classes:
        bpy.utils.register_class(cls)


def unregister():
    for cls in reversed(_classes):
        bpy.utils.unregister_class(cls)
