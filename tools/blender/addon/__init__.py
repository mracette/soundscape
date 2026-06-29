bl_info = {
    "name": "Soundscape Bindings",
    "author": "Soundscape",
    "version": (0, 1, 0),
    "blender": (5, 1, 0),
    "location": "View3D > Sidebar > Soundscape",
    "description": "Author audio-reactive bindings exported via glTF extras",
    "category": "Object",
}

from . import bindings_model, panel


def register():
    bindings_model.register()
    panel.register()


def unregister():
    panel.unregister()
    bindings_model.unregister()
