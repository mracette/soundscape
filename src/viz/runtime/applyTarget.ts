import type { Object3D, Mesh, Material } from "three";
import type { TargetProperty } from "../../bindings";

/**
 * Write an evaluated binding value onto its target object. Material targets
 * (emissiveIntensity, opacity) act on a mesh's first material; transform
 * targets act on the object. Setting opacity also flags the material
 * transparent so the value actually takes visible effect.
 */
export function applyTarget(
  object: Object3D,
  property: TargetProperty,
  value: number
): void {
  switch (property) {
    case "emissiveIntensity": {
      const m = materialOf(object);
      if (m && "emissiveIntensity" in m) {
        (m as Material & { emissiveIntensity: number }).emissiveIntensity = value;
      }
      return;
    }
    case "opacity": {
      const m = materialOf(object);
      if (m) {
        m.transparent = true;
        m.opacity = value;
      }
      return;
    }
    case "scale":
      object.scale.setScalar(value);
      return;
    case "scale.x": object.scale.x = value; return;
    case "scale.y": object.scale.y = value; return;
    case "scale.z": object.scale.z = value; return;
    case "rotation.x": object.rotation.x = value; return;
    case "rotation.y": object.rotation.y = value; return;
    case "rotation.z": object.rotation.z = value; return;
    case "position.x": object.position.x = value; return;
    case "position.y": object.position.y = value; return;
    case "position.z": object.position.z = value; return;
  }
}

function materialOf(object: Object3D): Material | undefined {
  const mat = (object as Mesh).material;
  if (!mat) return undefined;
  return Array.isArray(mat) ? mat[0] : mat;
}
