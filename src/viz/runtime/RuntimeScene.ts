import {
  Clock,
  PerspectiveCamera,
  WebGLRenderer,
  type Material,
  type Mesh,
  type Object3D,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { applyColorParity } from "./colorPipeline";
import { SceneRuntime } from "./SceneRuntime";
import type { SignalSource } from "./signal";

declare global {
  interface Window {
    /** DEV-only handle for e2e: read a bound object's live emissiveIntensity by name. */
    __runtimeSceneDebug?: {
      sample(objectName: string): number;
    };
  }
}

/** Constructor options for {@link RuntimeScene}. */
export interface RuntimeSceneOptions {
  /** GLB url; loaded with GLTFLoader. */
  url: string;
  signalSource: SignalSource;
  /** Invoked once after the GLB loads and the RAF loop starts (CanvasViz load gate). */
  onLoaded: () => void;
}

/**
 * Host for a new-runtime scene, mirroring the small duck-typed surface
 * `CanvasViz` touches on legacy scenes: it loads a GLB, drives it with a
 * {@link SceneRuntime}, and owns its own renderer/RAF loop. Unlike the legacy
 * scenes (classes on `three-legacy`) this runs on the latest `three`.
 *
 * The camera comes from the GLB when it ships one, else a default framing the
 * origin. A GLB load failure is logged and still resolves the load gate
 * (`onLoaded`) so a bad asset can never wedge the app's loading state.
 */
export class RuntimeScene {
  /** Set by CanvasViz; when true the RAF loop skips update + render. */
  pauseVisuals = false;
  /** Set by CanvasViz; unused internally (the signal source gates itself). */
  playerState: Record<string, boolean> | undefined;
  /** CanvasViz only special-cases "cinematic"; everything else is fullscreen. */
  resizeMethod = "fullscreen";
  /** Bound so CanvasViz can add/remove it as a window listener detached. */
  readonly onWindowResize: () => void;

  private readonly canvas: HTMLCanvasElement;
  private readonly signalSource: SignalSource;
  private readonly renderer: WebGLRenderer;
  private camera!: PerspectiveCamera;
  private scene: Object3D | null = null;
  private runtime: SceneRuntime | null = null;
  private readonly clock = new Clock();
  private raf = 0;
  private disposed = false;

  constructor(canvas: HTMLCanvasElement, options: RuntimeSceneOptions) {
    this.canvas = canvas;
    this.signalSource = options.signalSource;
    this.renderer = new WebGLRenderer({ canvas, antialias: false });
    applyColorParity(this.renderer);
    this.resize();
    this.onWindowResize = this.handleResize.bind(this);
    this.load(options);
    if (import.meta.env.DEV) {
      window.__runtimeSceneDebug = {
        sample: (objectName) => this.sampleEmissiveIntensity(objectName),
      };
    }
  }

  /** Look up a loaded object by name (available after `onLoaded`). For harness/tests. */
  getObjectByName(name: string): Object3D | undefined {
    return this.scene?.getObjectByName(name);
  }

  /** Read the live emissiveIntensity of a named mesh's first material (e2e reaction proof). */
  private sampleEmissiveIntensity(name: string): number {
    const mesh = this.getObjectByName(name) as Mesh | undefined;
    const mat = mesh?.material;
    const m = Array.isArray(mat) ? mat[0] : mat;
    return m && "emissiveIntensity" in m
      ? (m as Material & { emissiveIntensity: number }).emissiveIntensity
      : NaN;
  }

  private load(options: RuntimeSceneOptions): void {
    new GLTFLoader().load(
      options.url,
      (gltf) => {
        if (this.disposed) return;
        this.scene = gltf.scene;
        const gltfCamera = gltf.cameras[0];
        this.camera =
          gltfCamera instanceof PerspectiveCamera
            ? gltfCamera
            : this.defaultCamera();
        this.runtime = new SceneRuntime({
          scene: this.scene,
          animations: gltf.animations,
          signalSource: this.signalSource,
        });
        this.handleResize();
        this.animate();
        options.onLoaded();
      },
      undefined,
      (err) => {
        console.error("RuntimeScene: GLB load failed", err);
        options.onLoaded();
      }
    );
  }

  private defaultCamera(): PerspectiveCamera {
    const camera = new PerspectiveCamera(50, this.aspect(), 0.1, 100);
    camera.position.set(0, 1.5, 6);
    camera.lookAt(0, 0, 0);
    return camera;
  }

  private aspect(): number {
    const w = this.canvas.clientWidth || this.canvas.width;
    const h = this.canvas.clientHeight || this.canvas.height;
    return h > 0 ? w / h : 1;
  }

  private resize(): void {
    const w = this.canvas.clientWidth || this.canvas.width;
    const h = this.canvas.clientHeight || this.canvas.height;
    this.renderer.setSize(w, h, false);
  }

  private handleResize(): void {
    this.resize();
    if (!this.camera) return;
    this.camera.aspect = this.aspect();
    this.camera.updateProjectionMatrix();
  }

  private animate = (): void => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.animate);
    if (this.pauseVisuals || !this.runtime || !this.scene) return;
    this.runtime.update(this.clock.getDelta());
    this.renderer.render(this.scene, this.camera);
  };

  /** Cancel the RAF loop and release renderer + scene GPU resources. */
  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.scene?.traverse((object) => {
      const mesh = object as Mesh;
      mesh.geometry?.dispose();
      const material = mesh.material;
      if (Array.isArray(material)) {
        material.forEach((m: Material) => m.dispose());
      } else {
        material?.dispose();
      }
    });
    this.renderer.dispose();
  }
}
