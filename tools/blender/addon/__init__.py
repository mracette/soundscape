bl_info = {
    "name": "Soundscape Bindings",
    "author": "Soundscape",
    "version": (0, 1, 0),
    "blender": (5, 1, 0),
    "location": "View3D > Sidebar > Soundscape",
    "description": "Author audio-reactive bindings exported via glTF extras",
    "category": "Object",
}

import importlib
import sys

# Reload-safe: when Blender re-runs this module on "Reload Scripts" (F3 → Reload
# Scripts), re-import our submodules in dependency order so code edits take effect
# without restarting Blender. On the first load nothing is in sys.modules yet, so
# this loop is a no-op.
_SUBMODULES = (
    "ease", "evaluator", "preview_target", "bake_bridge",
    "bindings_model", "bands_model", "panel", "preview",
)
for _name in _SUBMODULES:
    _mod = sys.modules.get(f"{__name__}.{_name}")
    if _mod is not None:
        importlib.reload(_mod)

from . import bindings_model, panel, bands_model, preview


def register():
    bindings_model.register()
    panel.register()
    bands_model.register()
    preview.register()


def unregister():
    preview.unregister()
    bands_model.unregister()
    panel.unregister()
    bindings_model.unregister()
