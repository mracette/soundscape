import { describe, it, expect } from "vitest";
import {
  AnimationClip,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  VectorKeyframeTrack,
} from "three";
import type { Source } from "../../bindings";
import { SceneRuntime } from "./SceneRuntime";
import type { SignalSource } from "./signal";

const constantSource = (level: number): SignalSource => ({
  read: (_source: Source) => level,
});

function reactiveMesh(): Mesh {
  const mesh = new Mesh(undefined, new MeshStandardMaterial());
  mesh.name = "reactive";
  mesh.userData.soundscape = {
    bindings: [
      {
        target: { property: "emissiveIntensity" },
        source: { band: "bass", measure: "volume" },
        transform: { outMin: 0, outMax: 4 },
      },
    ],
  };
  return mesh;
}

describe("SceneRuntime", () => {
  it("applies a binding's evaluated value to its target each update", () => {
    const mesh = reactiveMesh();
    const runtime = new SceneRuntime({ scene: mesh, signalSource: constantSource(0.5) });
    runtime.update(1 / 60);
    expect((mesh.material as MeshStandardMaterial).emissiveIntensity).toBe(2);
  });

  it("advances baked idle animation via the mixer", () => {
    const obj = new Object3D();
    const track = new VectorKeyframeTrack(".position", [0, 1], [0, 0, 0, 0, 10, 0]);
    const clip = new AnimationClip("idle", 1, [track]);
    const runtime = new SceneRuntime({
      scene: obj,
      animations: [clip],
      signalSource: constantSource(0),
    });
    runtime.update(0.5);
    expect(obj.position.y).toBeCloseTo(5, 1);
  });

  it("skips objects with invalid bindings without throwing", () => {
    const material = new MeshStandardMaterial();
    material.emissiveIntensity = 0.123; // sentinel, distinct from the default
    const mesh = new Mesh(undefined, material);
    mesh.userData.soundscape = { bindings: [{ target: { property: "nope" } }] };
    const runtime = new SceneRuntime({ scene: mesh, signalSource: constantSource(1) });
    expect(() => runtime.update(0)).not.toThrow();
    expect(material.emissiveIntensity).toBe(0.123); // untouched -> binding was skipped
  });

  it("calls the signal source's optional update() once per frame", () => {
    let updates = 0;
    const source: SignalSource = { update: () => { updates++; }, read: () => 0 };
    const runtime = new SceneRuntime({ scene: new Object3D(), signalSource: source });
    runtime.update(0);
    runtime.update(0);
    expect(updates).toBe(2);
  });
});
