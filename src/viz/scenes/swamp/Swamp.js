// libs
import * as THREE from "three";
import { SceneManager } from "../../SceneManager";
import chroma from "chroma-js";
import FirstPersonControls from "../../controls/FirstPersonControls";
import { renderHut } from "./renderHut";

// globals
export const COLORS = {
  // vine: chroma("#142A1F").darken(.8).hex(),
  vine: chroma("#010503").darken(0.8).hex(),
  tree: chroma("#0A0805").darken(0.085).hex(),
  fog: chroma("#cccccc").hex(),
  lily: chroma("LightPink").darken(4.5).hex(),
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

    console.log(this.rhythmAnalyser);
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
      const vineMat = new THREE.MeshBasicMaterial({ color: COLORS.vine });
      const treeMat = new THREE.MeshBasicMaterial({ color: COLORS.tree });
      const lilyMat = new THREE.MeshBasicMaterial({ color: COLORS.lily });
      const roofMat = new THREE.MeshBasicMaterial({ color: COLORS.roof });
      const chimneyMat = new THREE.MeshBasicMaterial({
        color: COLORS.chimney,
      });

      this.applyAll(sceneObjects, (obj) => {
        const type = obj.type.toLowerCase();
        const name = obj.name;

        if (type.includes("light")) {
          if (name.includes("house_light")) {
            this.lights.houseLight = obj;
            obj.color = new THREE.Color(COLORS.moonYellow);
            obj.intensity = 0;
          } else {
            // remove light
            obj.intensity = 0;
          }
        } else if (type.includes("camera")) {
          obj.fov = this.fov || 45;
          obj.updateProjectionMatrix();
        } else if (type.includes("mesh")) {
          obj.material && (obj.material.roughness = 1);
          if (name.includes("water_001")) {
            this.subjects.water = obj;
            // obj.material.roughness = 0;
          } else if (name.includes("house_base")) {
            this.subjects.houseBase = obj;
            obj.material = new THREE.MeshBasicMaterial({
              color: COLORS.moonYellow,
            });
            obj.material.side = THREE.DoubleSide;
          } else if (name.includes("background")) {
            this.subjects.background = obj;
            obj.material = new THREE.MeshBasicMaterial({ color: 0x000000 });
            obj.material.side = THREE.DoubleSide;
          } else if (name.includes("vine")) {
            obj.material = vineMat;
          } else if (name.includes("tree") && obj.material.map === null) {
            obj.material = treeMat;
          } else if (name.includes("flower")) {
            obj.material = lilyMat;
          } else if (name.includes("roof")) {
            obj.material = roofMat;
          } else if (name.includes("chimney")) {
            obj.material = chimneyMat;
          }
        }
      });

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

  loadModels(modelList) {
    return new Promise((resolve, reject) => {
      const loadPromiseArray = [];

      loadPromiseArray.push(
        new Promise((resolve, reject) => {
          this.loadModel({ name: "swamp_test" }).then((model) => {
            this.preProcessSceneObjects(model.scene).then(() => {
              this.scene.add(model.scene);
              this.camera = model.cameras[0];
              this.camera.layers.enable(1);
              this.applySceneSettings();
              resolve();
            });
          });
        })
      );

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
      renderHut(
        {
          light: this.lights.houseLight,
          hut: this.subjects.houseBase,
          background: this.subjects.background,
        },
        this.bassAnalyser,
        {
          beats: this.elapsedBeats,
          colors: [COLORS.green, COLORS.lily, COLORS.purple],
        }
      );
      this.renderer.render(this.scene, this.camera);
    }
  }
}
