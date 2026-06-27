import * as THREE from "three";
import { SceneManager } from "../../SceneManager";
import chroma from "chroma-js";
import FirstPersonControls from "../../controls/FirstPersonControls";
import { Mist } from "./Mist";
import { renderHut } from "./renderHut";
import { renderFlowers } from "./renderFlowers";
import { renderShrooms } from "./renderShrooms";
import { renderEyes } from "./renderEyes";
import { Analyser } from "../../../classes/Analyser";
import { clamp } from "../../../utils/mathUtils";

export const COLORS = {
  black: chroma("#000000").hex() as string,
  vine: chroma("#010503").darken(0.8).hex() as string,
  tree: chroma("#0A0805").darken(0.085).hex() as string,
  fog: chroma("#cccccc").hex() as string,
  flower: chroma("#DA4167").hex() as string,
  darkGreen: chroma("darkgreen").darken(1.95).hex() as string,
  darkFlower: chroma("#DA4167").darken(4.5).hex() as string,
  mushroom: chroma("#3F250B").darken(2.5).hex() as string,
  chimney: chroma("#040404").darken(1).hex() as string,
  roof: chroma("#0E0F0C").hex() as string,
  darkBlue: chroma("#5669AE").hex() as string,
  purple: chroma("#9A4A91").hex() as string,
  green: chroma("#53DD6C").hex() as string,
  moonYellow: chroma("#f6f2d5").hex() as string,
};

interface SwampExtras {
  spectrumFunction: (n: number) => string;
  bpm: number;
}

interface Shroom {
  mesh: THREE.Mesh;
  baseColor: string;
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
    extras: SwampExtras
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
    // outputEncoding exists in r108 but is absent from @types/three@0.103.2
    (this.renderer as any).outputEncoding = THREE.sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.setClearColor(0x000000, 0);
  }

  preProcessSceneObjects(sceneObjects: THREE.Object3D) {
    return new Promise<void>((resolve) => {
      const vineMat = new THREE.MeshBasicMaterial({ color: COLORS.vine });
      const treeMat = new THREE.MeshBasicMaterial({ color: COLORS.tree });
      const flowerMat = new THREE.MeshBasicMaterial({
        color: COLORS.darkFlower,
        emissive: COLORS.flower,
        emissiveIntensity: 0,
      } as THREE.MeshBasicMaterialParameters);
      const lilyMat = new THREE.MeshBasicMaterial({
        color: COLORS.darkGreen,
      });
      const roofMat = new THREE.MeshBasicMaterial({ color: COLORS.roof });
      const chimneyMat = new THREE.MeshBasicMaterial({
        color: COLORS.chimney,
      });

      this.applyAll(sceneObjects, (obj) => {
        const mesh = obj as THREE.Mesh & {
          material: THREE.MeshBasicMaterial & {
            name: string;
            map: THREE.Texture | null;
          };
          fov?: number;
        };
        const type = obj.type.toLowerCase();
        const name = obj.name.toLowerCase();
        if (type.includes("light")) {
          const light = obj as THREE.Light;
          if (name.includes("house_light")) {
            this.lights.houseLight = light;
            light.color = new THREE.Color(COLORS.moonYellow);
            light.intensity = 0;
          } else {
            // remove light
            light.intensity = 0;
          }
        } else if (type.includes("camera")) {
          const cam = obj as THREE.PerspectiveCamera;
          cam.fov = this.fov || 45;
          cam.updateProjectionMatrix();
        } else if (type.includes("mesh")) {
          // no meshes move !
          (obj as any).matrixAutoUpdates = false;
          if (mesh.material) {
            (mesh.material as any).roughness = 1;
          }
          if (name.includes("reference")) {
            const mist = (this.subjects.mist as Mist).mist;
            mist.rotateY(-Math.PI / 4);
            mist.scale.set(0.25, 0.2, 0.2);
            mist.position.set(obj.position.x, obj.position.y, obj.position.z);
            obj.visible = false;
          } else if (name.includes("water_001")) {
            this.subjects.water = obj;
          } else if (
            (name.includes("sphere") || name.includes("cylinder")) &&
            mesh.material.name.includes("eyes")
          ) {
            const halfWay = chroma(this.spectrumFunction(0.35)).hex() as string;
            mesh.material = new THREE.MeshBasicMaterial({
              color: new THREE.Color(halfWay),
              side: THREE.DoubleSide,
            });
            mesh.material.userData.baseColor = halfWay;
            (this.subjects.eyes as THREE.Mesh[]).push(mesh);
          } else if (name.includes("house_base")) {
            this.subjects.houseBase = mesh;
            mesh.material = new THREE.MeshBasicMaterial({
              color: COLORS.moonYellow,
            });
            mesh.material.side = THREE.DoubleSide;
          } else if (name.includes("background")) {
            this.subjects.background = mesh;
            mesh.material = new THREE.MeshBasicMaterial({ color: 0x000000 });
            mesh.material.side = THREE.DoubleSide;
          } else if (name.includes("vine")) {
            (this.subjects.vines as THREE.Mesh[]).push(mesh);
            mesh.material = vineMat.clone();
          } else if (name.includes("tree") && mesh.material.map === null) {
            mesh.material = treeMat;
          } else if (name.includes("lilypad")) {
            mesh.material = lilyMat;
          } else if (name.includes("flower")) {
            mesh.material = flowerMat.clone();
            (this.subjects.flowers as THREE.Mesh[]).push(mesh);
          } else if (name.includes("lily")) {
            mesh.material = flowerMat.clone();
          } else if (name.includes("roof")) {
            mesh.material = roofMat;
          } else if (name.includes("chimney")) {
            mesh.material = chimneyMat;
          } else if (name.includes("cube")) {
            if (mesh.material.name.includes("lantern_baked")) {
              mesh.material = treeMat.clone();
            } else if (mesh.material.name.includes("lantern_em")) {
              mesh.material = new THREE.MeshBasicMaterial({
                color: new THREE.Color(COLORS.moonYellow),
              });
            }
          } else if (mesh.material.name.includes("mushroom")) {
            if (mesh.material.name.includes("mushroom_stem")) {
              mesh.material = new THREE.MeshBasicMaterial({
                color: COLORS.mushroom,
                side: THREE.DoubleSide,
              });
            } else {
              const rand = Math.random();
              let color: string;
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
              mesh.material = mat;
              (this.subjects.shrooms as Shroom[]).push({
                mesh,
                baseColor: color,
              });
            }
          }
        }
      });
      resolve();
    });
  }

  getNewFov(aspectRatio: number) {
    const fovMin = 25;
    const fovMax = 50;
    const aspectMin = 0.5;
    const aspectMax = 3;
    const aspectAdj = clamp(aspectRatio, aspectMin, aspectMax);
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
    // THREE.Fog types only accept number but r108 accepts strings too
    scene.fog = new THREE.Fog(COLORS.fog as unknown as number, 1, 240);
    return scene;
  }

  initLights() {
    const lights: Record<string, unknown> = {
      hemisphere: new THREE.HemisphereLight(
        new THREE.Color(COLORS.moonYellow),
        new THREE.Color(COLORS.moonYellow),
        17.5
      ),
    };

    this.scene.add(lights.hemisphere as THREE.HemisphereLight);

    return lights;
  }

  initSubjects() {
    return {
      mist: new Mist(this.scene, this.melodyAnalyser, {
        spectrumFunction: this.spectrumFunction,
      }),
      shrooms: [] as Shroom[],
      flowers: [] as THREE.Mesh[],
      vines: [] as THREE.Mesh[],
      eyes: [] as THREE.Mesh[],
    };
  }

  loadModels(_modelList?: string[]) {
    return new Promise<void>((resolve, reject) => {
      const loadPromiseArray: Promise<void>[] = [];

      loadPromiseArray.push(
        new Promise<void>((resolve) => {
          this.loadModel({ name: "swamp" }).then((model) => {
            this.preProcessSceneObjects(model.scene).then(() => {
              this.scene.add(model.scene);
              this.camera = model.cameras[0] as THREE.PerspectiveCamera;
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

  protected render(overridePause?: boolean) {
    if (!this.pauseVisuals || overridePause) {
      this.elapsedBeats = (this.bpm! * this.clock.getElapsedTime()) / 60;
      this.fpcControl && (this.controls.fpc as FirstPersonControls).update(this.clock.getDelta());
      renderHut(
        {
          light: this.lights.houseLight as THREE.Light,
          hut: this.subjects.houseBase as THREE.Mesh,
          background: this.subjects.background as THREE.Mesh,
        },
        this.bassAnalyser,
        {
          beats: this.elapsedBeats,
          colors: [COLORS.green, COLORS.flower, COLORS.purple],
        }
      );
      renderFlowers(
        {
          flowers: this.subjects.flowers as THREE.Mesh[],
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
      renderShrooms(
        { shrooms: this.subjects.shrooms as Shroom[] },
        this.rhythmAnalyser,
        {
          beats: this.elapsedBeats,
        }
      );
      renderEyes(
        { eyes: this.subjects.eyes as THREE.Mesh[] },
        this.atmosphereAnalyser,
        {
          beats: this.elapsedBeats,
        }
      );
      (this.subjects.mist as Mist).render();
      this.renderer.render(this.scene, this.camera);
    }
  }
}
