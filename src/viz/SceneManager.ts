import * as THREE from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import FirstPersonControls from "./controls/FirstPersonControls";

// stats.js has no bundled types — minimal shim for the dynamic import
interface StatsInstance {
  begin(): void;
  end(): void;
  showPanel(panel: number): void;
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
      showStats: false,
      fpcControl: false,
    };

    // bind properties to 'this'
    Object.assign(this, opts);
    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);

    // run initialization functions
    this.setSceneDimensions();
  }

  init() {
    this.scene = this.initScene();
    this.renderer = this.initRender();
    this.camera = this.initCamera();
    this.controls = this.initControls();
    this.subjects = this.initSubjects();
    this.lights = this.initLights();
    this.helpers = this.initHelpers();
  }

  stop() {
    window.cancelAnimationFrame(this.currentFrame);
  }

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

  animate() {
    this.showStats && this.helpers.stats?.begin();
    this.render();
    this.showStats && this.helpers.stats?.end();
    this.currentFrame = requestAnimationFrame(this.animate);
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
      import("stats.js").then(({ default: Stats }) => {
        const s = new Stats();
        s.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        s.dom.style.left = null!;
        s.dom.style.right = "0px";
        document.body.appendChild(s.dom);
        helpers.stats = s;
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
    this.render(true);
  }

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
