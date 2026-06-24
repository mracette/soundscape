// libs
import * as THREE from "three";
import { SceneManager } from "../../SceneManager";
import chroma from "chroma-js";
import FirstPersonControls from "../../controls/FirstPersonControls";
import { Mist } from "./Mist";
import { Analyser } from "../../../classes/Analyser";

// globals
export const COLORS = {
  black: (chroma as any)("#000000").hex() as string,
  vine: (chroma as any)("#010503").darken(0.8).hex() as string,
  tree: (chroma as any)("#0A0805").darken(0.085).hex() as string,
  fog: (chroma as any)("#cccccc").hex() as string,
  flower: (chroma as any)("#DA4167").hex() as string,
  darkFlower: (chroma as any)("#DA4167").darken(4.5).hex() as string,
  mushroom: (chroma as any)("#3F250B").darken(2.5).hex() as string,
  chimney: (chroma as any)("#040404").darken(1).hex() as string,
  roof: (chroma as any)("#0E0F0C").hex() as string,
  darkBlue: (chroma as any)("#5669AE").hex() as string,
  purple: (chroma as any)("#9A4A91").hex() as string,
  green: (chroma as any)("#53DD6C").hex() as string,
  moonYellow: (chroma as any)("#f6f2d5").hex() as string,
};

const RENDER_LIST = ["swamp_test"];

interface SwampMistExtras {
  spectrumFunction: (n: number) => string;
  bpm: number;
}

export class Swamp extends SceneManager {
  rhythmAnalyser!: Analyser;
  atmosphereAnalyser!: Analyser;
  harmonyAnalyser!: Analyser;
  melodyAnalyser!: Analyser;
  bassAnalyser!: Analyser;
  elapsedBeats!: number;

  constructor(
    canvas: HTMLCanvasElement,
    analysers: Record<string, Analyser>,
    callback: () => void,
    extras: SwampMistExtras
  ) {
    super(canvas);

    const opts = {
      dprMax: 2.25,
      fov: 20,
      spectrumFunction: extras.spectrumFunction,
      songId: "swamp",
      resizeMethod: "cinematic",
      bpm: extras.bpm,
      fovAdjust: false,
      fpcControl: false,
    };

    Object.assign(this, opts);
    this.rhythmAnalyser = analysers["rhythm"];
    this.atmosphereAnalyser = analysers["extras"];
    this.harmonyAnalyser = analysers["harmony"];
    this.melodyAnalyser = analysers["melody"];
    this.bassAnalyser = analysers["bass"];

    this.setup(callback);
  }

  setup(callback: () => void) {
    super.init();
    this.loadModels(RENDER_LIST)
      .then(() => {
        super.onWindowResize();
        super.animate();
        callback();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  applySceneSettings() {
    // outputEncoding exists in r108 but is absent from @types/three@0.103.2
    (this.renderer as any).outputEncoding = THREE.sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.setClearColor(0x000000, 0);
  }

  preProcessSceneObjects(_sceneObjects: THREE.Object3D) {
    return new Promise<void>((resolve) => {
      resolve();
    });
  }

  getNewFov(aspectRatio: number) {
    const fovMin = 25;
    const fovMax = 50;
    const aspectMin = 0.5;
    const aspectMax = 3;
    const aspectAdj = Math.max(aspectMin, Math.min(aspectRatio, aspectMax));
    const newFov =
      fovMax -
      ((fovMax - fovMin) * (aspectAdj - aspectMin)) / (aspectMax - aspectMin);
    return newFov;
  }

  initControls() {
    const controls: Record<string, unknown> = {};

    if (this.fpcControl) {
      controls.fpc = new FirstPersonControls(this.camera);
    }

    return controls;
  }

  initScene() {
    const scene = new THREE.Scene();
    (scene as any).background = 0x222222;
    // THREE.Fog types only accept number but r108 accepts strings too
    scene.fog = new THREE.Fog(COLORS.fog as unknown as number, 1, 280);
    return scene;
  }

  initLights() {
    const lights: Record<string, unknown> = {
      hemisphere: new THREE.HemisphereLight(0xffffff, 0xffffff, 11.5),
    };

    this.scene.add(lights.hemisphere as THREE.HemisphereLight);

    return lights;
  }

  initSubjects() {
    return {
      mist: new Mist(this.scene, this.melodyAnalyser, {
        spectrumFunction: this.spectrumFunction,
      }),
      shrooms: [] as unknown[],
      flowers: [] as unknown[],
    };
  }

  loadModels(_modelList?: string[]) {
    return new Promise<void>((resolve, reject) => {
      const loadPromiseArray: Promise<void>[] = [];
      Promise.all(loadPromiseArray)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(`Error loading models: ${err}`);
        });
    });
  }

  protected render(overridePause?: boolean) {
    if (!this.pauseVisuals || overridePause) {
      this.elapsedBeats = (this.bpm! * this.clock.getElapsedTime()) / 60;
      this.fpcControl && (this.controls.fpc as FirstPersonControls).update(this.clock.getDelta());
      (this.subjects.mist as Mist).render();
      this.renderer.render(this.scene, this.camera);
    }
  }
}
