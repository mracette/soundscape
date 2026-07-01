import * as THREE from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import FirstPersonControls from "./controls/FirstPersonControls";
import { FrameTelemetry, TelemetrySnapshot } from "./telemetry";

// Cap the render loop to 60fps. On high-refresh displays (120Hz+) RAF would
// otherwise render 2x as often — pure heat/battery for an ambient visualizer,
// with no visible benefit (motion is time-based, not per-frame).
const TARGET_FPS = 60;
const FRAME_INTERVAL_MS = 1000 / TARGET_FPS;
// Jitter margin: render when within this of the target interval. Without it, a
// true 60Hz display (frames arriving a hair under 16.67ms) gets halved to 30fps;
// the margin sits safely between a 120Hz frame (8.33ms) and a 60Hz one (16.67ms),
// so 60Hz renders every frame and 120Hz renders every other = 60.
const FRAME_TOLERANCE_MS = 4;

// stats.js has no bundled types — minimal shim for the dynamic import
interface StatsPanel {
  update(value: number, maxValue: number): void;
}
interface StatsInstance {
  begin(): void;
  end(): void;
  showPanel(panel: number): void;
  addPanel(panel: StatsPanel): StatsPanel;
  dom: HTMLElement;
}

interface SceneDimensions {
  width: number;
  height: number;
}

interface Controls {
  fpc?: FirstPersonControls;
  [key: string]: unknown;
}

// Helpers bag — gltfLoader is always present; stats is added asynchronously
interface Helpers {
  gltfLoader: GLTFLoader;
  stats?: StatsInstance;
  [key: string]: unknown;
}

// Lights bag — ambient is set by base; subclasses add named lights
interface Lights {
  ambient?: THREE.AmbientLight;
  [key: string]: unknown;
}

// Subjects bag — subclasses populate this with named subjects
type Subjects = Record<string, unknown>;

interface LoadModelOptions {
  name: string;
  [key: string]: unknown;
}

/**
 * Base class for every visualizer scene. Owns the three.js renderer, camera,
 * and RAF loop, and defines the initialization lifecycle that subclasses fill in:
 * `initScene` → `initRender` → `initCamera` → `initControls` → `initSubjects`
 * → `initLights` → `initHelpers`. Call `init()` once after constructing, then
 * `animate()` / `stop()` to start and halt the render loop.
 *
 * Subclasses must override `render()` — the base implementation is a no-op.
 * All other `init*` methods have default implementations that subclasses can
 * override or extend.
 */
export class SceneManager {
  // Core options (set via Object.assign in constructor)
  protected songId!: string | null;
  protected fov!: number;
  protected bpm!: number | null;
  protected dprMax!: number;
  protected canvas!: HTMLCanvasElement;
  protected clock!: THREE.Clock;
  // public: read/written by CanvasViz (external consumer)
  resizeMethod!: string;
  pauseVisuals!: boolean;
  playerState?: Record<string, boolean>;
  protected sceneDimensions!: SceneDimensions;
  protected spectrumFunction!: (n: number) => string;
  protected showStats!: boolean;
  protected fpcControl!: boolean;
  protected telemetry?: FrameTelemetry;
  protected perfPanels?: { cpu: StatsPanel; gpu: StatsPanel };
  protected lastFrameTime = 0;

  // Fields set by init() and subclasses
  // public: scene is read by CanvasViz (newScene.disposeAll(newScene.scene))
  scene!: THREE.Scene;
  protected renderer!: THREE.WebGLRenderer;
  protected camera!: THREE.PerspectiveCamera;
  protected controls!: Controls;
  protected subjects!: Subjects;
  protected lights!: Lights;
  protected helpers!: Helpers;

  // Animation frame handle
  protected currentFrame!: number;

  constructor(canvas: HTMLCanvasElement) {
    const opts = {
      songId: null,
      fov: 60,
      bpm: null,
      dprMax: 5,
      canvas,
      clock: new THREE.Clock(true),
      resizeMethod: "fullscreen",
      pauseVisuals: false,
      sceneDimensions: {
        width: null,
        height: null,
      },
      spectrumFunction: (_n: number) => "#FFFFFF",
      // Perf telemetry + stats overlay opt-in via ?perf=1 (off in production).
      showStats: new URLSearchParams(window.location.search).has("perf"),
      fpcControl: false,
    };

    // bind properties to 'this'
    Object.assign(this, opts);
    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);

    // run initialization functions
    this.setSceneDimensions();
  }

  /** Run all init* lifecycle methods in order and assign results to instance fields. */
  init() {
    this.scene = this.initScene();
    this.renderer = this.initRender();
    this.camera = this.initCamera();
    this.controls = this.initControls();
    this.subjects = this.initSubjects();
    this.lights = this.initLights();
    this.helpers = this.initHelpers();

    if (this.showStats) {
      this.telemetry = new FrameTelemetry(
        this.renderer.getContext() as WebGLRenderingContext
      );
      (window as unknown as { __perf: unknown }).__perf = {
        snapshot: (): TelemetrySnapshot => this.telemetry!.snapshot(),
      };
    }
  }

  /** Cancel the RAF loop. Call `animate()` to restart it. */
  stop() {
    window.cancelAnimationFrame(this.currentFrame);
  }

  /**
   * Full teardown on unmount: stop the loop, free the scene's GPU resources, and
   * dispose the renderer's too — deterministic release rather than waiting for GC.
   */
  dispose() {
    this.stop();
    this.disposeAll(this.scene);
    this.renderer.dispose();
  }

  /**
   * Recompute `sceneDimensions` from the current `resizeMethod`.
   * "fullscreen" uses `window.innerWidth/Height`; "cinematic" uses the canvas
   * element's CSS dimensions. Called in the constructor and in `onWindowResize`.
   */
  setSceneDimensions() {
    this.sceneDimensions = {
      width:
        this.resizeMethod === "cinematic"
          ? this.canvas.clientWidth
          : this.resizeMethod === "fullscreen"
          ? window.innerWidth
          : null!,
      height:
        this.resizeMethod === "cinematic"
          ? this.canvas.clientHeight
          : this.resizeMethod === "fullscreen"
          ? window.innerHeight
          : null!,
    };
  }

  /**
   * Recursively walk `obj`'s descendants and invoke `callback` on every leaf
   * (a node with no children). Intermediate branch nodes are skipped.
   * Names in `exceptions` are matched with `includes()` against `child.name`
   * and excluded from the callback.
   */
  applyAll(
    obj: THREE.Object3D,
    callback: (child: THREE.Object3D) => void,
    exceptions: string[] = []
  ) {
    // recursively apply callback to all descendants of obj
    obj.children.forEach((child) => {
      if (child.children.length > 0) {
        this.applyAll(child, callback, exceptions);
      } else {
        if (!exceptions.find((ex) => child.name.includes(ex))) {
          callback(child);
        }
      }
    });
  }

  /**
   * Recursively free GPU resources for `obj` and every descendant: geometries,
   * materials, and any texture maps stored as properties on the material
   * (e.g. `map`, `bumpMap`, `normalMap`, `envMap`). Children are removed from
   * the parent after disposal so three.js doesn't hold stale references.
   * Call this before discarding a scene to prevent GPU memory leaks.
   */
  disposeAll(obj: any, material = true, geometry = true) {
    while (obj.children.length > 0) {
      this.disposeAll(obj.children[0], material, geometry);
      obj.remove(obj.children[0]);
    }
    if (geometry && obj.geometry) obj.geometry.dispose();
    if (material && obj.material) {
      // in case of map, bumpMap, normalMap, envMap ...
      Object.keys(obj.material).forEach((prop) => {
        if (!obj.material[prop]) return;
        if (typeof obj.material[prop].dispose === "function")
          obj.material[prop].dispose();
      });
      obj.material.dispose();
    }
  }

  /**
   * Single RAF tick: bracket stats, call `render()`, then re-queue itself.
   * Subclasses that need to drive the loop at a different cadence (e.g. Swamp,
   * Moonrise) call `super.animate()` from their own overridden `animate()`.
   * Bound to `this` in the constructor so it can be passed directly to
   * `requestAnimationFrame`.
   */
  animate() {
    this.currentFrame = requestAnimationFrame(this.animate);

    // Frame-rate cap: skip this tick unless ~1/60s (minus a jitter margin) has
    // elapsed since the last rendered frame. Advance the accumulator by the
    // exact interval rather than snapping to `now`, so the remainder carries
    // over — snapping quantizes the rate to refresh/ceil(interval/period),
    // e.g. 90Hz→45fps, 144Hz→72fps, 165Hz→55fps.
    const now = performance.now();
    if (now - this.lastFrameTime < FRAME_INTERVAL_MS - FRAME_TOLERANCE_MS) return;
    this.lastFrameTime += FRAME_INTERVAL_MS;
    // Drift clamp: after a stall (hidden tab, long GC pause) the accumulator
    // sits far in the past and would render every tick to "catch up" — resync.
    if (now - this.lastFrameTime > 2 * FRAME_INTERVAL_MS) this.lastFrameTime = now;

    this.showStats && this.helpers.stats?.begin();
    this.telemetry?.beginFrame();
    this.render();
    this.telemetry?.endFrame();
    this.showStats && this.helpers.stats?.end();
    if (this.telemetry && this.perfPanels) {
      const snap = this.telemetry.snapshot();
      this.perfPanels.cpu.update(snap.cpuMs, 33);
      this.perfPanels.gpu.update(snap.gpuMs ?? 0, 33);
    }
  }

  // Subclasses must implement render(); base class calls it in animate() and onWindowResize()
  protected render(_forceUpdate?: boolean): void {
    // overridden by subclasses
  }

  initScene() {
    const scene = new THREE.Scene();
    return scene;
  }

  initRender() {
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      canvas: this.canvas,
      antialias: true,
    });

    // autoClear is a typed instance property on WebGLRenderer
    renderer.autoClear = false;
    // outputEncoding exists in r108 runtime but is absent from @types/three@0.103.2
    (renderer as any).outputEncoding = THREE.sRGBEncoding;

    renderer.setPixelRatio(this.getPixelRatio());
    renderer.setSize(this.sceneDimensions.width, this.sceneDimensions.height);

    return renderer;
  }

  initCamera() {
    const nearPlane = 1;
    const farPlane = 10000;
    const camera = new THREE.PerspectiveCamera(
      this.getFov(),
      1,
      nearPlane,
      farPlane
    );
    camera.aspect = this.getAspectRatio();
    camera.position.set(0, 10, 115);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.updateProjectionMatrix();
    return camera;
  }

  initControls(): Controls {
    const controls: Controls = {};
    this.fpcControl && (controls.fpc = new FirstPersonControls(this.camera));
    return controls;
  }

  initSubjects(): Subjects {
    const subjects: Subjects = {};
    return subjects;
  }

  initLights(): Lights {
    const lights: Lights = {
      ambient: new THREE.AmbientLight(0xffffff, 0.1),
    };
    this.scene.add(lights.ambient!);
    this.lights = lights;
    return lights;
  }

  initHelpers(): Helpers {
    const helpers: Helpers = {
      gltfLoader: new GLTFLoader(),
    };
    if (this.showStats) {
      import("stats.js").then((mod) => {
        const Stats = mod.default as unknown as {
          new (): StatsInstance;
          Panel: new (name: string, fg: string, bg: string) => StatsPanel;
        };
        const s = new Stats();
        s.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        s.dom.style.left = null!;
        s.dom.style.right = "0px";
        document.body.appendChild(s.dom);
        helpers.stats = s;
        const cpu = s.addPanel(new Stats.Panel("CPU ms", "#0ff", "#002"));
        const gpu = s.addPanel(new Stats.Panel("GPU ms", "#f0f", "#202"));
        this.perfPanels = { cpu, gpu };
      });
    }
    return helpers;
  }

  getFov() {
    return this.fov;
  }

  getAspectRatio() {
    return this.sceneDimensions.width / this.sceneDimensions.height;
  }

  getPixelRatio() {
    return Math.min(window.devicePixelRatio || 1, this.dprMax || 4);
  }

  onWindowResize() {
    // this function shouldn't contain any DOM resizing logic, just scene logic
    this.setSceneDimensions();
    this.camera.fov = this.getFov();
    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();
    if (this.resizeMethod === "fullscreen") {
      this.renderer.setSize(
        this.sceneDimensions.width,
        this.sceneDimensions.height
      );
    }
    // autoClear is off, so nothing wipes the drawing buffer between frames. A
    // freshly sized buffer can hold uninitialized GPU memory that survives the
    // first paint (whose clear color is transparent and may not cover the whole
    // viewport). Clear once here — the first paint runs through onWindowResize —
    // so that garbage never shows.
    this.renderer.clear();
    this.render(true);
  }

  /**
   * Load a GLTF/GLB model for this scene via the shared `gltfLoader`.
   * The asset URL is built from env vars: `REACT_APP_ASSET_LOCATION` selects
   * "local" (BASE_URL/models/…) or "cloudfront" (REACT_APP_ASSET_DOMAIN/…).
   * Format (.glb vs .gltf) is read from `REACT_APP_MODEL_FORMAT_<SONGID>`,
   * falling back to `REACT_APP_MODEL_FORMAT`.
   */
  loadModel(options: LoadModelOptions = { name: "" }): Promise<GLTF> {
    const { name } = options;
    const format =
      import.meta.env[`REACT_APP_MODEL_FORMAT_${this.songId!.toUpperCase()}`] ||
      import.meta.env.REACT_APP_MODEL_FORMAT;

    let ext: string;

    if (format === "glb") {
      ext = ".glb";
    } else {
      ext = ".gltf";
    }

    return new Promise((resolve, reject) => {
      let url: string;

      if (import.meta.env.REACT_APP_ASSET_LOCATION === "local") {
        url = `${import.meta.env.BASE_URL}models/${this.songId}/${name}${ext}`;
      } else if (import.meta.env.REACT_APP_ASSET_LOCATION === "cloudfront") {
        url = `${import.meta.env.REACT_APP_ASSET_DOMAIN}/app/models/${this.songId}/${format}/${name}${ext}`;
      } else {
        url = "";
      }

      this.helpers.gltfLoader.load(
        url,
        (model) => resolve(model),
        null!,
        (err) => reject(err)
      );
    });
  }

  convertMaterialToBasic(
    mat: THREE.Material & { color?: THREE.Color },
    params: { color?: THREE.Color; side?: THREE.Side } = {}
  ) {
    const newMat = new THREE.MeshBasicMaterial({
      color: params.color || (mat as any).color,
      side: params.side || THREE.DoubleSide,
    });
    mat.dispose();
    return newMat;
  }

  convertMaterialToLambert(
    mat: THREE.Material & { color?: THREE.Color; map?: THREE.Texture | null },
    params: { color?: THREE.Color } = {}
  ) {
    const newMat = new THREE.MeshLambertMaterial({
      color: params.color || (mat as any).color,
      map: (mat as any).map,
    });
    mat.dispose();
    return newMat;
  }
}
