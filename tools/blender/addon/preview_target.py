# Maps a binding's three.js target property to a Blender property. Component-wise
# and directionally correct for tuning — three is Y-up, Blender Z-up, but we do NOT
# remap axes here (the artist shapes parameters against what they see).

_AXIS = {"x": 0, "y": 1, "z": 2}


def _principled(obj):
    mat = obj.active_material
    if mat is None or not mat.use_nodes:
        return None
    for node in mat.node_tree.nodes:
        if node.type == "BSDF_PRINCIPLED":
            return node
    return None


def apply_target(obj, target_property, value):
    if target_property.startswith("position."):
        obj.location[_AXIS[target_property[9:]]] = value
    elif target_property.startswith("rotation."):
        obj.rotation_euler[_AXIS[target_property[9:]]] = value
    elif target_property.startswith("scale."):
        obj.scale[_AXIS[target_property[6:]]] = value
    elif target_property == "scale":
        obj.scale = (value, value, value)
    elif target_property == "emissiveIntensity":
        node = _principled(obj)
        if node is not None:
            node.inputs["Emission Strength"].default_value = value
    elif target_property == "opacity":
        node = _principled(obj)
        if node is not None:
            node.inputs["Alpha"].default_value = value


def read_target(obj, target_property):
    """Current value of the mapped property, for snapshot/restore. Returns None
    for a material target with no Principled node."""
    if target_property.startswith("position."):
        return obj.location[_AXIS[target_property[9:]]]
    if target_property.startswith("rotation."):
        return obj.rotation_euler[_AXIS[target_property[9:]]]
    if target_property.startswith("scale."):
        return obj.scale[_AXIS[target_property[6:]]]
    if target_property == "scale":
        return obj.scale[0]
    if target_property == "emissiveIntensity":
        node = _principled(obj)
        return node.inputs["Emission Strength"].default_value if node else None
    if target_property == "opacity":
        node = _principled(obj)
        return node.inputs["Alpha"].default_value if node else None
    return None
