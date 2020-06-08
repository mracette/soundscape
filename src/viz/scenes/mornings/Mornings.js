// libs
import * as THREE from "three";
import { SceneManager } from "../../SceneManager";
import FirstPersonControls from "../../controls/FirstPersonControls";
import { lerp, normalize } from "crco-utils";

// rendering
import { renderBass } from "./renderBass";
import { renderRhythm } from "./renderRhythm";
import { renderHarmony } from "./renderHarmony";
import { renderMelody } from "./renderMelody";
import { renderAtmosphere } from "./renderAtmosphere";

// shaders
import { rgbaVertex, rgbaFragment } from "../../shaders/rgba";

// globals
const CANVAS_STYLE = `
background-color: none; background: 
linear-gradient(
    to top, 
    #F0A9B3 45%, 
    #D8B7B6 55%,
    #BEBDC3 70%,
    #A1BCD4 85%,
    #80BDE8 100%
);`;

const COLORS = {
  morningLight: new THREE.Color(0xf0a9b3),
  plant: new THREE.Color(0x7b9e53),
  white: new THREE.Color(0xffffff),
  paleBlue: new THREE.Color(0xdeeeff),
  coffee: new THREE.Color(0x260e00),
  deepBlue: new THREE.Color(0x213058),
  blueGrey: new THREE.Color(0xb0b1b6),
};

const RENDER_LIST = ["house", "plant", "table", "bookcase", "flower"];

const FREEZE_EXCEPTIONS = [
  "steam",
  "van_gogh",
  "vonnegut",
  "carpet",
  "god_rays_top",
  "god_rays_bottom",
];

export class Mornings extends SceneManager {
  constructor(canvas, analysers, callback, extras) {
    super(canvas);

    const opts = {
      songId: "mornings",
      spectrumFunction: extras.spectrumFunction,
      dprMax: 2.25,
      bpm: extras.bpm,
    };

    Object.assign(this, opts);
    this.canvas.style = CANVAS_STYLE;
    this.rhythmAnalyser = analysers["rhythm"];
    this.atmosphereAnalyser = analysers["extras"];
    this.harmonyAnalyser = analysers["harmony"];
    this.melodyAnalyser = analysers["melody"];
    this.bassAnalyser = analysers["bass"];

    super.init();

    this.loadModels(RENDER_LIST)
      .then(() => {
        this.applySceneSettings();
        this.preProcessSceneObjects();
        this.render(RENDER_LIST);
        super.animate();
        callback();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  applySceneSettings() {
    this.renderer.shadowMap.enabled = false;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    this.renderer.setClearColor(0x000000, 0.0);

    this.camera.position.set(
      -36.792147432025736,
      12.295984744079584,
      19.50565058881036
    );
    this.camera.lookAt(
      46.69487932551039,
      2.382592629313793,
      -34.638979984916375
    );
  }

  preProcessSceneObjects() {
    this.applyAll(
      this.scene,
      (child) => {
        // freeze objects that don't move
        child.matrixAutoUpdates = false;
        // lambert material is the most efficient
        if (child.material && child.material.type === "MeshStandardMaterial") {
          const mat = new THREE.MeshLambertMaterial({
            color: child.material.color,
            side: THREE.DoubleSide,
            emissive: child.material.emissive,
            emissiveIntensity: child.material.emissiveIntensity,
          });
          child.material.dispose();
          child.material = mat;
        }
      },
      FREEZE_EXCEPTIONS
    );
  }

  getFov() {
    const aspect = this.getAspectRatio();
    const aspectAmt = normalize(aspect, 0.5, 3, true);
    const newFov = lerp(50, 25, aspectAmt);
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
    return scene;
  }

  initLights() {
    const lights = {
      ambient: new THREE.AmbientLight(
        COLORS.morningLight.clone().lerp(COLORS.white, 0.65),
        0.35
      ),
      sunlight: new THREE.DirectionalLight(COLORS.white, 0),
      pointOne: new THREE.PointLight(0xffffff, 0.1),
    };

    lights.pointOne.position.set(
      -36.792147432025736,
      12.295984744079584,
      19.50565058881036
    );

    this.scene.add(lights.ambient);
    this.scene.add(lights.sunlight);
    this.scene.add(lights.sunlight.target);
    this.scene.add(lights.pointOne);

    return lights;
  }

  loadModels(modelList) {
    return new Promise((resolve, reject) => {
      const loadPromiseArray = [];

      // house and god rays
      modelList.indexOf("house") !== -1 &&
        loadPromiseArray.push(
          new Promise((resolve, reject) => {
            this.subjects.stringLights = [];
            this.subjects.godRays = [];

            this.loadModel({ name: "house" }).then((model) => {
              model.scene.children.forEach((mesh) => {
                if (
                  mesh.type === "Group" &&
                  mesh.name.includes("string_light")
                ) {
                  mesh.children[1].material.emissive =
                    mesh.children[1].material.color;
                  this.subjects.stringLights.push(mesh.children[1]);
                }

                if (mesh.name === "bushes") {
                  mesh.material.emissive = mesh.material.color;
                  mesh.material.emissiveIntensity = 0.5;
                }

                if (
                  mesh.name === "god_rays_top" ||
                  mesh.name === "god_rays_bottom"
                ) {
                  mesh.material = new THREE.MeshBasicMaterial({
                    color: COLORS.white,
                    transparent: true,
                    side: THREE.DoubleSide,
                    opacity: 0.025,
                  });
                  this.subjects.godRays.push(mesh);
                }
              });

              this.scene.add(model.scene);
              resolve();
            });
          })
        );

      // paintings
      modelList.indexOf("house") !== -1 &&
        loadPromiseArray.push(
          new Promise((resolve, reject) => {
            this.loadModel({ name: "paintings" }).then((model) => {
              model.scene.children.forEach((mesh) => {
                if (mesh.name === "vonnegut_self_portrait") {
                  mesh.material.side = THREE.FrontSide;
                  mesh.material.map.minFilter = THREE.LinearFilter;
                }
                if (mesh.name === "van_gogh") {
                  mesh.material.side = THREE.BackSide;
                  mesh.material.map.minFilter = THREE.LinearFilter;
                }
              });

              this.scene.add(model.scene);
              resolve();
            });
          })
        );

      // table
      modelList.indexOf("table") !== -1 &&
        loadPromiseArray.push(
          new Promise((resolve, reject) => {
            this.loadModel({ name: "table" }).then((model) => {
              const pageGeo = new THREE.PlaneBufferGeometry(1.9, 1.8, 64, 64);
              pageGeo.rotateX(-Math.PI / 2);

              model.scene.children.forEach((mesh) => {
                if (mesh.name.includes("mug_coffee")) {
                  mesh.material = new THREE.MeshBasicMaterial({
                    color: COLORS.coffee,
                  });
                }

                if (mesh.name.includes("mug_top")) {
                  mesh.material.color = new THREE.Color(0x666666);
                }

                if (
                  mesh.name === "left_page_ref" ||
                  mesh.name === "right_page_ref"
                ) {
                  const colors = new Array(
                    pageGeo.attributes.position.count * 4
                  );

                  const newMesh = mesh.clone();
                  newMesh.geometry = pageGeo.clone();
                  newMesh.geometry.addAttribute(
                    "customColor",
                    new THREE.Float32BufferAttribute(colors, 4)
                  );
                  newMesh.material = new THREE.ShaderMaterial({
                    transparent: true,
                    side: THREE.DoubleSide,
                    vertexShader: rgbaVertex,
                    fragmentShader: rgbaFragment,
                    vertexColors: THREE.VertexColors,
                  });

                  this.scene.add(newMesh);

                  mesh.name === "right_page_ref" &&
                    (this.subjects.rightPage = newMesh);
                  mesh.name === "left_page_ref" &&
                    (this.subjects.leftPage = newMesh);
                }

                if (mesh.name === "steam") {
                  mesh.material = new THREE.MeshBasicMaterial({
                    color: COLORS.white,
                    transparent: true,
                    side: THREE.DoubleSide,
                    opacity: 0.025,
                  });
                  this.subjects.steam = mesh;
                }
              });

              model.scene.children
                .filter((c) => c.name.includes("page"))
                .forEach((mesh) => model.scene.remove(mesh));
              this.scene.add(model.scene);

              resolve();
            });
          })
        );

      // flowers
      modelList.indexOf("flower") !== -1 &&
        loadPromiseArray.push(
          new Promise((resolve, reject) => {
            const stickLeaves = [];
            const stickLeavesOne = [];
            this.subjects.innerPetals = [];
            this.subjects.outerPetals = [];

            this.loadModel({ name: "flowers" }).then((model) => {
              model.scene.children.forEach((mesh) => {
                if (mesh.name.includes("Inner_Petals")) {
                  mesh.material.emissive = mesh.material.color;
                  mesh.material.emissiveIntensity = 0;
                  this.subjects.innerPetals.push(mesh);
                }

                if (mesh.name.includes("Outer_Petals")) {
                  mesh.material.emissive = mesh.material.color;
                  mesh.material.emissiveIntensity = 0;
                  this.subjects.outerPetals.push(mesh);
                }

                if (mesh.name.includes("stick_leaves_one")) {
                  mesh.material = new THREE.MeshLambertMaterial({
                    color: COLORS.plant,
                    emissive: COLORS.plant,
                    emissiveIntensity: 0,
                  });
                  stickLeavesOne.push(mesh);
                } else if (mesh.name.includes("stick_leaves")) {
                  mesh.material = new THREE.MeshLambertMaterial({
                    color: COLORS.plant,
                    emissive: COLORS.plant,
                    emissiveIntensity: 0,
                  });
                  stickLeaves.push(mesh);
                }
              });

              this.subjects.stickLeaves = stickLeaves;
              this.subjects.stickLeavesOne = stickLeavesOne;

              this.scene.add(model.scene);

              resolve();
            });
          })
        );

      // spiral plant
      modelList.indexOf("plant") !== -1 &&
        loadPromiseArray.push(
          new Promise((resolve, reject) => {
            this.loadModel({ name: "spiral_plant" }).then((model) => {
              const leaves = [];

              model.scene.children
                .filter((mesh) => mesh.name.includes("spiral_plant_leaf"))
                .forEach((mesh) => {
                  mesh.material = new THREE.MeshLambertMaterial({
                    color: COLORS.plant,
                    emissive: COLORS.plant,
                    emissiveIntensity: 0,
                  });
                  leaves.push(mesh);
                });

              this.subjects.spiralPlantLeaves = leaves;

              this.scene.add(model.scene);

              resolve();
            });
          })
        );

      // bookshelf
      modelList.indexOf("bookcase") !== -1 &&
        loadPromiseArray.push(
          new Promise((resolve, reject) => {
            // 3d array: columns, rows, books in cell
            this.subjects.books = new Array(4)
              .fill(null)
              .map((d) => new Array(5).fill(null).map((d) => []));

            this.loadModel({ name: "bookcase" }).then((model) => {
              const pageMat = new THREE.MeshLambertMaterial({
                color: 0xe7daca,
                side: THREE.DoubleSide,
              });

              model.scene.children.forEach((mesh) => {
                if (
                  mesh.name.includes("book") &&
                  !mesh.name.includes("bookcase") &&
                  mesh.type === "Group"
                ) {
                  const name = mesh.name;
                  const z = parseInt(name.slice(name.length - 1, name.length));
                  const y = parseInt(
                    name.slice(name.length - 2, name.length - 1)
                  );
                  const x = parseInt(
                    name.slice(name.length - 3, name.length - 2)
                  );
                  const r = -0.1 + Math.random() * 0.2;
                  const c = new THREE.Color(
                    this.spectrumFunction(1 - (r + y + 0.5) / 5)
                  );

                  const bookMesh = mesh.children.find((mesh) =>
                    mesh.material.name.includes("book")
                  );
                  const pageMesh = mesh.children.find((mesh) =>
                    mesh.material.name.includes("page")
                  );

                  pageMesh.material = pageMat;
                  bookMesh.material = new THREE.MeshLambertMaterial({
                    color: c,
                    side: THREE.DoubleSide,
                    emissive: c,
                    emissiveIntensity: 0.1,
                  });

                  this.subjects.books[x][y][z] = bookMesh;
                }
              });

              this.scene.add(model.scene);

              resolve();
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

      this.subjects.steam.rotateY(-0.05);

      this.playerState &&
        (this.playerState.melody || overridePause) &&
        renderMelody(
          {
            innerPetals: this.subjects.innerPetals,
            outerPetals: this.subjects.outerPetals,
            leftPage: this.subjects.leftPage,
            rightPage: this.subjects.rightPage,
          },
          this.melodyAnalyser,
          {
            spectrumFunction: this.spectrumFunction,
            beats: this.elapsedBeats,
          }
        );

      this.playerState &&
        (this.playerState.bass || overridePause) &&
        renderBass(this.subjects.godRays, this.bassAnalyser, {
          sunlight: this.lights.sunlight,
        });

      this.playerState &&
        (this.playerState.rhythm || overridePause) &&
        renderRhythm(this.subjects.books, this.rhythmAnalyser, {
          spectrumFunction: this.spectrumFunction,
          beats: this.elapsedBeats,
        });

      this.playerState &&
        (this.playerState.harmony || overridePause) &&
        renderHarmony(
          {
            leaves: this.subjects.spiralPlantLeaves,
            stickLeaves: this.subjects.stickLeaves,
            stickLeavesOne: this.subjects.stickLeavesOne,
            group: this.subjects.spiralPlantGroup,
            box: this.subjects.spiralPlantBox,
          },
          this.harmonyAnalyser,
          {
            beats: this.elapsedBeats,
          }
        );

      this.playerState &&
        (this.playerState.extras || overridePause) &&
        renderAtmosphere(this.subjects.stringLights, this.atmosphereAnalyser, {
          beats: this.elapsedBeats,
          enabled: this.playerState.extras,
        });

      this.renderer.render(this.scene, this.camera);
    }
  }
}
