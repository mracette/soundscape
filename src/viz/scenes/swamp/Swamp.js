// libs
import * as THREE from "three";
import { SceneManager } from "../../SceneManager";
import chroma from "chroma-js";
import FirstPersonControls from "../../controls/FirstPersonControls";
import { Mist } from "./Mist";
import { renderHut } from "./renderHut";
import { renderFlowers } from "./renderFlowers";
import { renderShrooms } from "./renderShrooms";
import { renderEyes } from "./renderEyes";

// globals
export const COLORS = {
  black: chroma("#000000").hex(),
  vine: chroma("#010503").darken(0.8).hex(),
  tree: chroma("#0A0805").darken(0.085).hex(),
  fog: chroma("#cccccc").hex(),
  flower: chroma("#DA4167").hex(),
  darkGreen: chroma("darkgreen").darken(1.95).hex(),
  darkFlower: chroma("#DA4167").darken(4.5).hex(),
  mushroom: chroma("#3F250B").darken(2.5).hex(),
  chimney: chroma("#040404").darken(1).hex(),
  roof: chroma("#0E0F0C").hex(),
  darkBlue: chroma("#5669AE").hex(),
  purple: chroma("#9A4A91").hex(),
  green: chroma("#53DD6C").hex(),
  moonYellow: chroma("#f6f2d5").hex(),
};

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
    this.loadModels()
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
      const flowerMat = new THREE.MeshBasicMaterial({
        color: COLORS.darkFlower,
        emissive: COLORS.flower,
        emissiveIntensity: 0,
      });
      const lilyMat = new THREE.MeshBasicMaterial({
        color: COLORS.darkGreen,
      });
      const roofMat = new THREE.MeshBasicMaterial({ color: COLORS.roof });
      const chimneyMat = new THREE.MeshBasicMaterial({
        color: COLORS.chimney,
      });

      this.applyAll(sceneObjects, (obj) => {
        const type = obj.type.toLowerCase();
        const name = obj.name.toLowerCase();
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
          // no meshes move !
          obj.matrixAutoUpdates = false;
          if (obj.material) {
            obj.material.roughness = 1;
          }
          if (name.includes("reference")) {
            const mist = this.subjects.mist.mist;
            mist.rotateY(-Math.PI / 4);
            mist.scale.set(0.25, 0.2, 0.2);
            mist.position.set(obj.position.x, obj.position.y, obj.position.z);
            obj.visible = false;
          } else if (name.includes("water_001")) {
            this.subjects.water = obj;
          } else if (
            (name.includes("sphere") || name.includes("cylinder")) &&
            obj.material.name.includes("eyes")
          ) {
            const halfWay = chroma(this.spectrumFunction(0.35)).hex();
            obj.material = new THREE.MeshBasicMaterial({
              color: new THREE.Color(halfWay),
              side: THREE.DoubleSide,
            });
            obj.material.userData.baseColor = halfWay;
            this.subjects.eyes.push(obj);
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
            this.subjects.vines.push(obj);
            obj.material = vineMat.clone();
            // obj.userData.active = false;
            // obj.userData.activeAmount = 0;
            // obj.userData.activeBeat = null;
            // obj.material.userData.color = chroma(
            //   this.spectrumFunction(Math.random())
            // ).hex();
          } else if (name.includes("tree") && obj.material.map === null) {
            obj.material = treeMat;
          } else if (name.includes("lilypad")) {
            obj.material = lilyMat;
          } else if (name.includes("flower")) {
            obj.material = flowerMat.clone();
            this.subjects.flowers.push(obj);
          } else if (name.includes("lily")) {
            obj.material = flowerMat.clone();
          } else if (name.includes("roof")) {
            obj.material = roofMat;
          } else if (name.includes("chimney")) {
            obj.material = chimneyMat;
          } else if (name.includes("cube")) {
            if (obj.material.name.includes("lantern_baked")) {
              obj.material = treeMat.clone();
            } else if (obj.material.name.includes("lantern_em")) {
              obj.material = new THREE.MeshBasicMaterial({
                color: new THREE.Color(COLORS.moonYellow),
              });
            }
          } else if (obj.material.name.includes("mushroom")) {
            if (obj.material.name.includes("mushroom_stem")) {
              obj.material = new THREE.MeshBasicMaterial({
                color: COLORS.mushroom,
                side: THREE.DoubleSide,
              });
            } else {
              const rand = Math.random();
              let color;
              if (rand < 0.33) {
                color = COLORS.green;
              } else if (rand < 0.66) {
                color = COLORS.purple;
              } else {
                color = COLORS.flower;
              }
              const mat = new THREE.MeshBasicMaterial({
                color: chroma.mix(color, COLORS.black, 0.5, "rgb").hex(),
                side: THREE.DoubleSide,
              });
              obj.material = mat;
              this.subjects.shrooms.push({
                mesh: obj,
                baseColor: color,
              });
            }
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
    scene.fog = new THREE.Fog(COLORS.fog, 1, 240);
    return scene;
  }

  initLights() {
    const lights = {
      hemisphere: new THREE.HemisphereLight(
        new THREE.Color(COLORS.moonYellow),
        new THREE.Color(COLORS.moonYellow),
        17.5
      ),
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
      vines: [],
      eyes: [],
    };
  }

  loadModels(modelList) {
    return new Promise((resolve, reject) => {
      const loadPromiseArray = [];

      loadPromiseArray.push(
        new Promise((resolve, reject) => {
          this.loadModel({ name: "swamp" }).then((model) => {
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
          colors: [COLORS.green, COLORS.flower, COLORS.purple],
        }
      );
      renderFlowers(
        {
          flowers: this.subjects.flowers,
        },
        this.harmonyAnalyser,
        {
          beats: this.elapsedBeats,
          colors: {
            flower: COLORS.flower,
            darkFlower: COLORS.darkFlower,
          },
        }
      );
      renderShrooms({ shrooms: this.subjects.shrooms }, this.rhythmAnalyser, {
        beats: this.elapsedBeats,
      });
      renderEyes({ eyes: this.subjects.eyes }, this.atmosphereAnalyser, {
        beats: this.elapsedBeats,
      });
      this.subjects.mist.render();
      this.renderer.render(this.scene, this.camera);
    }
  }
}
