import os

import bpy

from . import bake_bridge, bands_model, bindings_model, preview_target
from .evaluator import BindingEvaluator


def build_preview_items(objects):
    """One item per binding across all objects, each with a persistent evaluator."""
    items = []
    for obj in objects:
        bindings = getattr(obj, "soundscape_bindings", None)
        if not bindings:
            continue
        for b in bindings:
            items.append({
                "obj": obj,
                "target_property": b.target_property,
                "band": b.band,
                "measure": b.measure,
                "bucket": b.bucket,
                "evaluator": BindingEvaluator(bindings_model.binding_to_dict(b)),
            })
    return items


def read_signal(bake, measure, bucket, frame):
    frames = bake["frames"]
    if not frames:
        return 0.0
    f = frames[frame] if frame < len(frames) else frames[-1]
    if measure == "bucket":
        buckets = f["buckets"]
        return buckets[bucket] if bucket < len(buckets) else 0.0
    return f["volume"]


def apply_frame(items, bakes, frame):
    for it in items:
        bake = bakes.get(it["band"])
        signal = read_signal(bake, it["measure"], it["bucket"], frame) if bake else 0.0
        value = it["evaluator"].evaluate(signal)
        preview_target.apply_target(it["obj"], it["target_property"], value)


def snapshot_items(items):
    return [
        (it["obj"], it["target_property"], preview_target.read_target(it["obj"], it["target_property"]))
        for it in items
    ]


def restore_snapshot(snapshot):
    for obj, target_property, old in snapshot:
        if old is not None:
            preview_target.apply_target(obj, target_property, old)


def _cache_dir():
    return os.path.join(bpy.app.tempdir, "soundscape_bakes")


class SOUNDSCAPE_OT_bake_bands(bpy.types.Operator):
    bl_idname = "soundscape.bake_bands"
    bl_label = "Bake All Bands"

    def execute(self, context):
        out_dir = _cache_dir()
        for band in context.scene.soundscape_bands:
            try:
                bake_bridge.bake_band(
                    {
                        "name": band.name,
                        "stem_path": bpy.path.abspath(band.stem_path),
                        "analyser_config": bands_model.band_analyser_config(band),
                        "num_buckets": band.num_buckets,
                        "fps": band.fps,
                    },
                    out_dir,
                )
            except Exception as exc:  # noqa: BLE001
                self.report({"ERROR"}, f"bake {band.name}: {exc}")
                return {"CANCELLED"}
        self.report({"INFO"}, f"baked {len(context.scene.soundscape_bands)} band(s)")
        return {"FINISHED"}


class SOUNDSCAPE_OT_preview(bpy.types.Operator):
    """Live-play the baked signal through the bindings; ESC or the button restores."""
    bl_idname = "soundscape.preview"
    bl_label = "Play Preview"

    _timer = None
    _items = None
    _snapshot = None
    _bakes = None
    _frame = 0
    _fps = 30

    def invoke(self, context, event):
        names = [b.name for b in context.scene.soundscape_bands]
        self._bakes = bake_bridge.load_bakes(_cache_dir(), names)
        if not self._bakes:
            self.report({"ERROR"}, "no bakes — run Bake All Bands first")
            return {"CANCELLED"}
        self._items = build_preview_items(context.scene.objects)
        self._snapshot = snapshot_items(self._items)
        self._frame = 0
        self._fps = max((b.fps for b in context.scene.soundscape_bands), default=30)
        wm = context.window_manager
        self._timer = wm.event_timer_add(1.0 / self._fps, window=context.window)
        wm.modal_handler_add(self)
        return {"RUNNING_MODAL"}

    def modal(self, context, event):
        if event.type in {"ESC", "RIGHTMOUSE"}:
            self.cancel(context)
            return {"CANCELLED"}
        if event.type == "TIMER":
            apply_frame(self._items, self._bakes, self._frame)
            self._frame += 1
            for area in context.screen.areas:
                if area.type == "VIEW_3D":
                    area.tag_redraw()
        return {"PASS_THROUGH"}

    def cancel(self, context):
        wm = context.window_manager
        if self._timer is not None:
            wm.event_timer_remove(self._timer)
            self._timer = None
        if self._snapshot is not None:
            restore_snapshot(self._snapshot)


class SOUNDSCAPE_PT_preview(bpy.types.Panel):
    bl_label = "Soundscape Preview"
    bl_idname = "SOUNDSCAPE_PT_preview"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "Soundscape"

    def draw(self, context):
        col = self.layout.column(align=True)
        col.operator("soundscape.bake_bands", icon="RENDER_ANIMATION")
        col.operator("soundscape.preview", icon="PLAY")


_classes = (SOUNDSCAPE_OT_bake_bands, SOUNDSCAPE_OT_preview, SOUNDSCAPE_PT_preview)


def register():
    for cls in _classes:
        bpy.utils.register_class(cls)


def unregister():
    for cls in reversed(_classes):
        bpy.utils.unregister_class(cls)
