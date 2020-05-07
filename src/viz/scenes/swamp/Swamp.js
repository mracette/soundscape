// libs
import * as THREE from "three";
import { SceneManager } from "../../SceneManager";
import chroma from "chroma-js";
import FirstPersonControls from "../../controls/FirstPersonControls";

// globals
const COLORS = {
  // vine: chroma("#142A1F").darken(.8).hex(),
  vine: chroma("#010503").darken(0.8).hex(),
  tree: chroma("#0A0805").darken(0.085).hex(),
  fog: chroma("#cccccc").hex(),
  lily: chroma("LightPink").darken(4.5).hex(),
  chimney: chroma("#040404").darken(1).hex(),
  roof: chroma("#0E0F0C").hex(),
};

const RENDER_LIST = ["swamp"];

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
    this.setup(callback);
  }

  setup(callback) {
    super.init();
    this.createFadeLayer();
    this.loadModels(RENDER_LIST)
      .then(() => {
        super.animate();
        callback();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  createFadeLayer() {
    // const clone = this.canvas.cloneNode();
    // clone.id = "fade-layer";
    // clone.style.zIndex = 10;
    // clone.style.backgroundColor = "red";
    // document.body.appendChild(clone);
    // this.onWindowResize = () => {
    //   super.onWindowResize();
    // };
  }

  applySceneSettings() {
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.setClearColor(0x000000, 0);
    this.onWindowResize(this.resizeMethod);
  }

  preProcessSceneObjects(sceneObjects) {
    return new Promise((resolve, reject) => {
      const lightIntensityAdj = 1 / 5;
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
          obj.intensity *= lightIntensityAdj;
        } else if (type.includes("camera")) {
          obj.fov = this.fov || 45;
          obj.updateProjectionMatrix();
        } else if (type.includes("mesh")) {
          if (name.includes("background")) {
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
      // ambient: new THREE.AmbientLight(0xffffff, 2),
      hemisphere: new THREE.HemisphereLight(0xffffff, 0xffffff, 10.5),
    };

    this.scene.add(lights.ambient, lights.hemisphere);

    return lights;
  }

  loadModels(modelList) {
    return new Promise((resolve, reject) => {
      const loadPromiseArray = [];

      modelList.indexOf("swamp") !== -1 &&
        loadPromiseArray.push(
          new Promise((resolve, reject) => {
            this.loadModel({ name: "swamp" }).then((model) => {
              this.preProcessSceneObjects(model.scene).then(() => {
                this.scene.add(model.scene);
                this.camera = model.cameras[0];
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
      this.renderer.render(this.scene, this.camera);
    }
  }
}
