import { describe, it, expect } from "vitest";
import { Mesh, MeshStandardMaterial, Object3D } from "three";
import { applyTarget } from "./applyTarget";

describe("applyTarget", () => {
  it("sets emissiveIntensity on the mesh material", () => {
    const mesh = new Mesh(undefined, new MeshStandardMaterial());
    applyTarget(mesh, "emissiveIntensity", 0.7);
    expect((mesh.material as MeshStandardMaterial).emissiveIntensity).toBe(0.7);
  });

  it("sets opacity and flags the material transparent", () => {
    const mat = new MeshStandardMaterial();
    applyTarget(new Mesh(undefined, mat), "opacity", 0.4);
    expect(mat.opacity).toBe(0.4);
    expect(mat.transparent).toBe(true);
  });

  it("sets a uniform scale", () => {
    const obj = new Object3D();
    applyTarget(obj, "scale", 3);
    expect(obj.scale.toArray()).toEqual([3, 3, 3]);
  });

  it("sets single transform axes", () => {
    const obj = new Object3D();
    applyTarget(obj, "rotation.y", 1.5);
    applyTarget(obj, "position.z", -2);
    expect(obj.rotation.y).toBe(1.5);
    expect(obj.position.z).toBe(-2);
  });

  it("is a no-op on an object with no material", () => {
    const obj = new Object3D();
    expect(() => applyTarget(obj, "emissiveIntensity", 1)).not.toThrow();
    expect(() => applyTarget(obj, "opacity", 0.5)).not.toThrow();
  });
});
