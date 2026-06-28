import { AnimationMixer, type AnimationClip, type Object3D } from "three";
import {
  validateUserData,
  type Binding,
  type SoundscapeUserData,
} from "../../bindings";
import { BindingEvaluator } from "./evaluator";
import { applyTarget } from "./applyTarget";
import type { SignalSource } from "./signal";

interface BoundTarget {
  object: Object3D;
  binding: Binding;
  evaluator: BindingEvaluator;
}

export interface SceneRuntimeOptions {
  scene: Object3D;
  animations?: AnimationClip[];
  signalSource: SignalSource;
}

/**
 * Drives a loaded scene from audio: advances baked idle animation via an
 * `AnimationMixer` and applies audio-reactive bindings each frame. Bindings are
 * read from each object's `userData.soundscape` (surfaced from glTF `extras`)
 * and validated; an invalid set is skipped with a warning rather than thrown,
 * so one bad object can't break the whole scene.
 */
export class SceneRuntime {
  readonly mixer: AnimationMixer;
  private readonly targets: BoundTarget[] = [];
  private readonly signalSource: SignalSource;

  constructor({ scene, animations = [], signalSource }: SceneRuntimeOptions) {
    this.signalSource = signalSource;
    this.mixer = new AnimationMixer(scene);
    for (const clip of animations) this.mixer.clipAction(clip).play();
    scene.traverse((object) => this.bind(object));
  }

  private bind(object: Object3D): void {
    const data = object.userData?.soundscape as unknown;
    if (data === undefined) return;
    const result = validateUserData(data);
    if (!result.valid) {
      console.warn(
        `[soundscape] invalid bindings on "${object.name}": ${result.errors.join("; ")}`
      );
      return;
    }
    for (const binding of (data as SoundscapeUserData).bindings) {
      this.targets.push({ object, binding, evaluator: new BindingEvaluator(binding) });
    }
  }

  /**
   * Advance one frame. `delta` (seconds since the last update) drives the idle
   * animation; reactive bindings sample the current audio signal.
   */
  update(delta: number): void {
    this.mixer.update(delta);
    this.signalSource.update?.();
    for (const t of this.targets) {
      const signal = this.signalSource.read(t.binding.source);
      applyTarget(t.object, t.binding.target.property, t.evaluator.evaluate(signal));
    }
  }
}
