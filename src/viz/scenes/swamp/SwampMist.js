// libs
import * as THREE from "three";
import { SceneManager } from "../../SceneManager";
import chroma from "chroma-js";
import FirstPersonControls from "../../controls/FirstPersonControls";
import { Mist } from "./Mist";
import { renderHut } from "./renderHut";
import { renderFlowers } from "./renderFlowers";
import { renderShrooms } from "./renderShrooms";

// globals
export const COLORS = {
  black: chroma("#000000").hex(),
  vine: chroma("#010503").darken(0.8).hex(),
  tree: chroma("#0A0805").darken(0.085).hex(),
  fog: chroma("#cccccc").hex(),
  flower: chroma("#DA4167").hex(),
  darkFlower: chroma("#DA4167").darken(4.5).hex(),
  mushroom: chroma("#3F250B").darken(2.5).hex(),
  chimney: chroma("#040404").darken(1).hex(),
  roof: chroma("#0E0F0C").hex(),
  darkBlue: chroma("#5669AE").hex(),
  purple: chroma("#9A4A91").hex(),
  green: chroma("#53DD6C").hex(),
  moonYellow: chroma("#f6f2d5").hex(),
};

const RENDER_LIST = ["swamp_test"];

export class Swamp extends SceneManager {
  constructor(canvas, analysers, callback, extras) {
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

  setup(callback) {
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
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.setClearColor(0x000000, 0);
  }

  preProcessSceneObjects(sceneObjects) {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  getNewFov(aspectRatio) {
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
    const controls = {};

    if (this.fpcControl) {
      controls.fpc = new FirstPersonControls(this.camera);
    }

    return controls;
  }

  initScene() {
    const scene = new THREE.Scene();
    scene.background = 0x222222;
    scene.fog = new THREE.Fog(COLORS.fog, 1, 280);
    return scene;
  }

  initLights() {
    const lights = {
      hemisphere: new THREE.HemisphereLight(0xffffff, 0xffffff, 11.5),
    };

    this.scene.add(lights.hemisphere);

    return lights;
  }

  initSubjects() {
    return {
      mist: new Mist(this.scene, this.melodyAnalyser, {
        spectrumFunction: this.spectrumFunction,
      }),
      shrooms: [],
      flowers: [],
    };
  }

  loadModels(modelList) {
    return new Promise((resolve, reject) => {
      const loadPromiseArray = [];
      Promise.all(loadPromiseArray)
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(`Error loading models: ${err}`);
        });
    });
  }

  render(overridePause) {
    if (!this.pauseVisuals || overridePause) {
      this.elapsedBeats = (this.bpm * this.clock.getElapsedTime()) / 60;
      this.fpcControl && this.controls.fpc.update(this.clock.getDelta());
      this.subjects.mist.render();
      this.renderer.render(this.scene, this.camera);
    }
  }
}
