import * as THREE from "three-legacy";
import * as d3Chromatic from "d3-scale-chromatic";
import { linToLog } from "../../../utils/mathUtils";
import { regularPolygon } from "../../../utils/mathUtils";
import { Analyser } from "../../../classes/Analyser";
import { StarQuadrants } from "../../subjects/StarQuadrants";

import { SceneManager } from "../../SceneManager";

const COLORS = {
  white: 0xffffff,
  rockGrey: 0x9d978e,
  lightning: 0xeee6ab,
  moonYellow: 0xf6f2d5,
  tropicalGreen: 0x70a491,
  deepInk: 0x030c22,
};

export class Moonrise extends SceneManager {
  rhythmAnalyser!: Analyser;
  atmosphereAnalyser!: Analyser;
  harmonyAnalyser!: Analyser;
  melodyAnalyser!: Analyser;
  bassAnalyser!: Analyser;
  prevMelodyVolume!: number;
  currentMelodyVolume!: number;

  constructor(
    canvas: HTMLCanvasElement,
    analysers: Record<string, Analyser>,
    callback: () => void,
    _extras: Record<string, unknown>
  ) {
    super(canvas);

    const opts = {
      songId: "moonrise",
      resizeMethod: "fullscreen",
      dprMax: 2.5,
      fov: 60,
    };

    Object.assign(this, opts);

    this.rhythmAnalyser = analysers["rhythm"];
    this.atmosphereAnalyser = analysers["atmosphere"];
    this.harmonyAnalyser = analysers["harmony"];
    this.melodyAnalyser = analysers["melody"];
    this.bassAnalyser = analysers["bass"];

    // lily vars
    this.prevMelodyVolume = 0;
    this.currentMelodyVolume = 0;

    super.init();

    this.scene.fog = new THREE.Fog(0xffffff, 10, 470);
    this.scene.background = new THREE.Color("#1F262F").lerp(
      new THREE.Color(0x000000),
      0.2
    );
    Promise.all([
      this.initLakeTrees(),
      this.initLakeScene(),
      this.initLakeRipples(),
      this.initLakeStars(),
      this.initLakeLilies(),
      this.initLakeMoon(),
    ]).then(() => {
      callback();
      super.animate();
    });
  }

  setup(callback: () => void) {
    this.applySceneSettings();
    Promise.all([
      this.initLakeTrees(),
      this.initLakeScene(),
      this.initLakeRipples(),
      this.initLakeStars(),
      this.initLakeLilies(),
      this.initLakeMoon(),
    ]).then(() => {
      callback();
      super.animate();
    });
  }

  applySceneSettings() {
    this.scene.fog = new THREE.Fog(0xffffff, 10, 470);
    this.scene.background = new THREE.Color("#1F262F").lerp(
      new THREE.Color(0x000000),
      0.2
    );
  }

  initLakeScene() {
    return new Promise<void>((resolve, reject) => {
      try {
        // hexagon shape for the lake body
        const lakeShapePoints = regularPolygon(6, 110, 0, 0, true, false, true);
        const lakeShapeVectors: THREE.Vector2[] = [];
        for (let i = 0; i < lakeShapePoints.length; i += 2) {
          lakeShapeVectors.push(
            new THREE.Vector2(lakeShapePoints[i], lakeShapePoints[i + 1])
          );
        }
        const lakeShape = new THREE.Shape(lakeShapeVectors);
        const lakeGeo = new THREE.ShapeBufferGeometry(lakeShape);
        lakeGeo.rotateX(-Math.PI / 2);
        lakeGeo.translate(0, 0, 70);
        const lakeMat = new THREE.MeshBasicMaterial({
          color: COLORS.deepInk,
          fog: false,
        });
        const lakeMesh = new THREE.Mesh(lakeGeo, lakeMat);
        this.subjects.lake = lakeMesh;
        this.scene.add(lakeMesh);

        // basic rectangle for the ground
        const groundGeo = new THREE.PlaneBufferGeometry(550, 350);
        groundGeo.rotateX(-Math.PI / 2);
        groundGeo.translate(0, -1, 0);
        const groundMat = new THREE.MeshBasicMaterial({
          color: 0x022a1e,
          fog: false,
        });
        groundMat.color.lerp(new THREE.Color(0x000000), 0.75);
        const groundMesh = new THREE.Mesh(groundGeo, groundMat);
        this.subjects.ground = groundMesh;
        this.scene.add(groundMesh);

        const moonGuard = new THREE.Mesh(
          new THREE.PlaneBufferGeometry(60, 30),
          groundMat
        );
        moonGuard.translateZ(-79);

        this.scene.add(moonGuard);

        // directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.18);
        directionalLight.position.set(0, 10, 0);
        this.scene.add(directionalLight);

        // point light fireflies
        const fireflyCount = 16;
        const fireFlyGroup = new THREE.Group();
        for (let i = 0; i < fireflyCount; i++) {
          const g = new THREE.Group();
          g.add(new THREE.PointLight(COLORS.moonYellow, 0.1));

          const sphereGeo = new THREE.SphereBufferGeometry(0.25);
          const sphereMat = new THREE.MeshBasicMaterial({
            color: COLORS.lightning,
            fog: false,
            transparent: true,
          });

          g.add(new THREE.Mesh(sphereGeo, sphereMat));

          g.position.set(
            -70 + Math.random() * 140,
            5 + Math.random() * 15,
            40 - Math.random() * 70
          );

          g.userData.cycle = 0;
          g.userData.state = "off";
          fireFlyGroup.add(g);
        }

        this.subjects.fireflies = fireFlyGroup;
        this.scene.add(fireFlyGroup);

        this.loadModel({ name: "landscape" })
          .then((model) => {
            this.subjects.rocks = model.scene.children.find(
              (e) => (e.name = "rockGroup")
            );
            (this.subjects.rocks as THREE.Group).children.forEach((rock) => {
              ((rock as THREE.Mesh).material as THREE.MeshStandardMaterial).color.setRGB(
                0.06,
                0.06,
                0.06
              );
            });
            this.scene.add(this.subjects.rocks as THREE.Group);
          })
          .catch((err) => {
            reject(err);
          });

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  initLakeMoon() {
    return new Promise<void>((resolve, reject) => {
      try {
        const moonRadius = 25;
        const numVertices = this.bassAnalyser.fftSize;
        const numMoonRings = 5;

        const moonGeo = new THREE.CircleBufferGeometry(
          moonRadius,
          numVertices,
          numVertices
        );
        const moonMat = new THREE.MeshBasicMaterial({
          color: COLORS.moonYellow,
          fog: false,
        });

        const moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.userData.radius = moonRadius;
        moonMesh.position.set(0, 35, -80);

        this.subjects.moon = moonMesh;
        this.scene.add(moonMesh);

        const moonRings = new THREE.Group(); // moonRings = group of numMoonRings(5) rings
        const moonBeams = new THREE.Group(); // moonBeams = group of 16 moonRings

        // 5 rings in the moonRings group
        for (let j = 0; j < numMoonRings; j++) {
          const moonRingGeo = new THREE.BufferGeometry();
          const positions = new Float32Array(numVertices * 3);
          // addAttribute exists in r108 runtime; absent from @types/three@0.103.2
          (moonRingGeo as any).addAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3)
          );
          moonRingGeo.setDrawRange(0, 0);

          const moonRingMat = new THREE.PointsMaterial({
            color: COLORS.moonYellow,
            transparent: true,
            opacity: 0.1 + j / 7,
          });

          const moonRing = new THREE.Points(moonRingGeo, moonRingMat);
          moonRings.add(moonRing);
        }

        for (let k = 0; k < 8; k++) {
          const newMoonRings = moonRings.clone();
          newMoonRings.translateY(moonMesh.position.y);
          newMoonRings.rotateZ(2 * Math.PI * (k / 16));
          moonBeams.add(newMoonRings);
        }

        this.subjects.moonBeams = moonBeams;
        moonBeams.userData.numMoonRings = numMoonRings;
        moonBeams.userData.numVertices = numVertices;
        this.scene.add(moonBeams);

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  initLakeTrees() {
    return new Promise<void>((resolve, reject) => {
      // load gltf tree models
      this.loadModel({ name: "pine-tree" })
        .then((model) => {
          const basePineTree = model.scenes[0].children[0] as THREE.Group;

          // generate simple tree formation
          const pineTreeGroup = new THREE.Group();
          const numPineTrees = 64;
          const xMin = -100;
          const xMax = 100;
          const xNoise = 5;
          const zNoise = 10;
          const scaleNoise = 0.3;

          for (let i = 1; i <= numPineTrees; i++) {
            const x =
              xMin +
              (i / numPineTrees) * (xMax - xMin) +
              (Math.random() * xNoise - xNoise / 2);

            // z(x) is piecewise and is calculated using the coordinates of the lake hexagon
            let z: number;
            if (x < -55) {
              z = -1 * ((95 / 55) * x + 190) - Math.random() * zNoise;
            } else if (x >= -55 && x < 55) {
              z = -95 - Math.random() * zNoise;
            } else {
              z = -1 * (-(95 / 55) * x + 190) - Math.random() * zNoise;
            }

            const clone = basePineTree.clone();
            const scale = 1 - scaleNoise * Math.random();

            (clone.children[0] as THREE.Mesh).material =
              new THREE.MeshBasicMaterial({
                color: new THREE.Color(COLORS.tropicalGreen).lerp(
                  new THREE.Color(COLORS.white),
                  -1.5
                ),
              });

            clone.position.copy(new THREE.Vector3(x, -2, z + 70));
            clone.scale.copy(new THREE.Vector3(scale, scale, scale));
            clone.rotateY(Math.random() * 2 * Math.PI);
            pineTreeGroup.add(clone);
          }
          this.subjects.pineTrees = pineTreeGroup;
          this.scene.add(pineTreeGroup);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  initLakeRipples() {
    return new Promise<void>((resolve, reject) => {
      try {
        const n = this.rhythmAnalyser.frequencyBinCount;
        const numSides = 6;
        const baseWidth = 1;
        const polygonPoints = regularPolygon(
          numSides,
          baseWidth,
          0,
          0,
          true,
          true
        );
        const bandScale = 100; // how far out the bands will extend
        const bandScaleLogConstants = linToLog(bandScale);

        const baseGeoGroup = new THREE.Group();
        const baseGeo = new THREE.BufferGeometry();
        // addAttribute exists in r108 runtime; absent from @types/three@0.103.2
        (baseGeo as any).addAttribute(
          "position",
          new THREE.BufferAttribute(polygonPoints, 3)
        );

        for (let i = 0; i < n; i++) {
          // clone and scale
          const geo = baseGeo.clone();
          const linScale = 1 + (i / n) * bandScale;
          const logScale =
            Math.log(linScale / bandScaleLogConstants.a) /
            bandScaleLogConstants.b;
          geo.scale(logScale, logScale, logScale);
          geo.translate(0, 0.05, 50);

          // add to group
          baseGeoGroup.add(
            new THREE.Line(
              geo,
              new THREE.LineBasicMaterial({
                color: COLORS.moonYellow,
                transparent: true,
                opacity: 0,
              })
            )
          );
        }

        // bind subject and add to scene
        this.subjects.ripples = baseGeoGroup;
        this.scene.add(baseGeoGroup);

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  initLakeStars() {
    return new Promise<void>((resolve, reject) => {
      try {
        this.subjects.stars = new StarQuadrants(
          this.scene,
          8,
          this.scene.background as THREE.Color,
          {
            count: 150,
            width: 600,
            height: 225,
            depth: 190,
            center: new THREE.Vector3(0, -13, -300),
            colorPalette: d3Chromatic.interpolateCool,
          }
        );
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  initLakeLilies() {
    return new Promise<void>((resolve, reject) => {
      this.loadModel({ name: "lily" })
        .then((model) => {
          const lily = model.scene.children.find(
            (c) => c.name === "Group"
          ) as THREE.Group;

          // breakdown
          const lowerPetal = lily.children[0].clone() as THREE.Mesh;
          const upperPetal = lily.children[1].clone() as THREE.Mesh;
          const sphere = lily.children[2].clone() as THREE.Mesh;
          sphere.name = "sphere";
          const lilyPad = lily.children[3].clone() as THREE.Mesh;
          lilyPad.name = "lilyPad";

          // initialize base lily
          const baseLily = new THREE.Group();
          const petalGroup = new THREE.Group();
          petalGroup.name = "petalGroup";

          // duplicate and rotate petals, adding each to their corresponding group
          for (let i = 0; i < 18; i++) {
            const upperClone = new THREE.Group().add(upperPetal.clone());
            upperClone.rotateY(Math.PI * 2 * (i / 8));

            const lowerClone = new THREE.Group().add(lowerPetal.clone());
            lowerClone.rotateY(Math.PI * 2 * (i / 8));

            petalGroup.add(upperClone);
            petalGroup.add(lowerClone);
          }

          baseLily.add(petalGroup, sphere, lilyPad);

          const numLilies = 23;
          const lilyGroup = new THREE.Group();

          const flowerMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0xffffff),
          });

          const padMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0x022a1e).lerp(new THREE.Color(0x000000), 1),
          });

          for (let i = 1; i <= numLilies; i++) {
            const clone = baseLily.clone();

            const petalColor = new THREE.Color(
              d3Chromatic.interpolateViridis(Math.random())
            );
            const petalMat = new THREE.MeshBasicMaterial({
              color: petalColor,
            });

            (clone.getObjectByName("petalGroup") as THREE.Group).children.forEach(
              (petalGroup) => {
                ((petalGroup as THREE.Group).children[0] as THREE.Mesh).material =
                  petalMat;
              }
            );

            (clone.getObjectByName("lilyPad") as THREE.Mesh).material = padMat;
            (clone.getObjectByName("sphere") as THREE.Mesh).material =
              flowerMat;

            const firstPattern = (i % 4) + 1;
            const secondPattern = Math.floor(i / 4) % 4;

            const scale = Math.max(2 * Math.random(), 1.4);
            let x = (firstPattern / 1.3) * (-1.5 * 7 + secondPattern * 7);
            x *= 1 + (-0.2 + Math.random() * 0.2);
            const z =
              102 -
              ((i % 4) / 3) * 18 -
              Math.random() * (10 - 15 * Math.floor(secondPattern / 2));

            clone.userData.petalColor = petalColor;
            clone.userData.ignited = false;
            clone.userData.phase = "waxing";
            clone.userData.measure = 0; // [0 - 1] phase cutoff at 0.5;

            clone.scale.copy(new THREE.Vector3(scale, scale, scale));
            clone.position.copy(new THREE.Vector3(x, 1, z));

            lilyGroup.add(clone);
          }

          this.subjects.lilies = lilyGroup;
          this.scene.add(lilyGroup);

          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  protected render(overridePause?: boolean) {
    if (!this.pauseVisuals || overridePause) {
      // this.controls.fpc.update(this.clock.getDelta());

      /*
       * RIPPLES
       */

      if (this.playerState && this.playerState.rhythm) {
        this.rhythmAnalyser.getFrequencyData();
        (this.rhythmAnalyser.fftData as Uint8Array).forEach((d, i) => {
          const damping = 180 * (i / this.rhythmAnalyser.frequencyBinCount);
          (
            (this.subjects.ripples as THREE.Group).children[i] as THREE.Line & {
              material: THREE.LineBasicMaterial;
            }
          ).material.opacity = (d - damping) / 500;
        });
      }

      /*
       * STARS
       */

      if (this.playerState && this.playerState.atmosphere) {
        this.atmosphereAnalyser.getFrequencyData("left");
        this.atmosphereAnalyser.getFrequencyData("right");

        (
          this.atmosphereAnalyser.fftData as {
            left: Uint8Array;
            right: Uint8Array;
          }
        )["left"]
          .slice(1, 9)
          .forEach((d, i) => {
            (
              (this.subjects.stars as StarQuadrants).leftGroup.children[
                i
              ] as THREE.Points & { material: THREE.PointsMaterial }
            ).material.opacity = d / 125;
          });

        (
          this.atmosphereAnalyser.fftData as {
            left: Uint8Array;
            right: Uint8Array;
          }
        )["right"]
          .slice(1, 9)
          .forEach((d, i) => {
            (
              (this.subjects.stars as StarQuadrants).rightGroup.children[
                i
              ] as THREE.Points & { material: THREE.PointsMaterial }
            ).material.opacity = d / 125;
          });
      }

      /*
       * TREES
       */

      if (this.playerState && this.playerState.harmony) {
        this.harmonyAnalyser.getFrequencyData();

        (this.subjects.pineTrees as THREE.Group).children.forEach((child, i) => {
          const freqIndex = Math.floor(i / 8);
          const rawData = (this.harmonyAnalyser.fftData as Uint8Array).slice([
            1 + freqIndex,
          ] as unknown as number)[0];
          const transformedData =
            Math.pow(rawData, 5) / (Math.pow(255, 5) * 0.06);

          const color = new THREE.Color(COLORS.tropicalGreen);
          color.lerp(new THREE.Color(COLORS.white), -1.5 + transformedData);

          (
            (child as THREE.Group).children[0] as THREE.Mesh & {
              material: THREE.MeshBasicMaterial;
            }
          ).material.color.set(color);
        });
      }

      /*
       * MOON
       */

      if (this.playerState && this.playerState.bass) {
        this.bassAnalyser.getFrequencyData();
        const fftData = this.bassAnalyser.fftData as Uint8Array;
        const avgBassVol =
          fftData.reduce((a, b) => {
            return a + b;
          }) / this.bassAnalyser.frequencyBinCount;
        const bassFrequencies = fftData.slice(
          0,
          (this.subjects.moonBeams as THREE.Group).userData.numMoonRings
        );
        const radius =
          (this.subjects.moon as THREE.Mesh).userData.radius * 0.5;

        // set just the first moon beam's geometry
        for (
          let moonRingIndex = 0;
          moonRingIndex <
          (this.subjects.moonBeams as THREE.Group).userData.numMoonRings;
          moonRingIndex++
        ) {
          for (
            let vertexCount = 0;
            vertexCount <
            (this.subjects.moonBeams as THREE.Group).userData.numVertices;
            vertexCount++
          ) {
            const adj = 1 / (0.15 * (moonRingIndex + 1));
            const rot = bassFrequencies[moonRingIndex] / 255;
            const moonRing = (
              (this.subjects.moonBeams as THREE.Group).children[0] as THREE.Group
            ).children[moonRingIndex] as THREE.Points;

            const ringGeo = moonRing.geometry as THREE.BufferGeometry;
            // TAKE 2: Outward fanning
            (ringGeo.attributes.position.array as Float32Array)[
              vertexCount * 3
            ] =
              (radius - 7 + (avgBassVol / 3) * adj) *
              Math.cos(
                2 *
                  Math.PI *
                  (vertexCount / this.bassAnalyser.fftSize + rot / 12)
              );
            (ringGeo.attributes.position.array as Float32Array)[
              vertexCount * 3 + 1
            ] =
              (radius - 7 + (avgBassVol / 3) * adj) *
              Math.sin(
                2 *
                  Math.PI *
                  (vertexCount / this.bassAnalyser.fftSize + rot / 6)
              );
            (ringGeo.attributes.position.array as Float32Array)[
              vertexCount * 3 + 2
            ] = -81;
          }
        }

        // copy the single moon beam's geometry into the other position arrays and update
        (this.subjects.moonBeams as THREE.Group).children.forEach(
          (moonBeam) => {
            (moonBeam as THREE.Group).children.forEach(
              (moonRing, moonRingIndex) => {
                const ring = moonRing as THREE.Points;
                const rGeo = ring.geometry as THREE.BufferGeometry;
                const srcGeo = (
                  (
                    (this.subjects.moonBeams as THREE.Group).children[0] as THREE.Group
                  ).children[moonRingIndex] as THREE.Points
                ).geometry as THREE.BufferGeometry;
                rGeo.attributes.position.array = srcGeo.attributes.position.array;
                rGeo.setDrawRange(0, rGeo.attributes.position.count);
                (rGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
              }
            );
          }
        );
      }

      /*
       * LILIES
       */

      if (this.playerState && this.playerState.melody) {
        this.melodyAnalyser.getFrequencyData(); //.slice(5);
        const melodyFftData = this.melodyAnalyser.fftData as Uint8Array;

        let melodyVolume = 0;
        let melodyCount = 0;

        for (let i = 0; i < melodyFftData.length; i++) {
          melodyVolume += melodyFftData[i];
          melodyCount++;
        }

        const avgMelodyVolume = melodyVolume / melodyCount;

        (this.subjects.lilies as THREE.Group).children.forEach((lily) => {
          const data = lily.userData;
          const increment = 0.11;

          if (
            !data.ignited &&
            // LATENT BUG: original JS uses bitwise & (not &&); preserved exactly
            (((avgMelodyVolume !== 0) as unknown as number) &
              ((avgMelodyVolume * Math.random() > 55) as unknown as number)) !==
              0
          ) {
            data.ignited = true;
          }
          if (data.ignited && data.phase === "waxing" && data.measure < 1) {
            data.measure = Math.min(2, data.measure + increment * 70);
          } else if (
            data.ignited &&
            data.phase === "waxing" &&
            data.measure > 1
          ) {
            data.phase = "waning";
            data.measure += -1 * increment;
          } else if (
            data.ignited &&
            data.phase === "waning" &&
            data.measure < 0
          ) {
            data.ignited = false;
            data.phase = "waxing";
          } else if (data.ignited && data.phase === "waning") {
            data.measure += -1 * increment;
          }

          const petalGroup = (lily as THREE.Group).getObjectByName(
            "petalGroup"
          ) as THREE.Group;
          (
            (petalGroup.children[0] as THREE.Group).children[0] as THREE.Mesh & {
              material: THREE.MeshBasicMaterial;
            }
          ).material.color = (lily.userData.petalColor as THREE.Color)
            .clone()
            .lerp(
              new THREE.Color(0xffffff),
              Math.max(0, (avgMelodyVolume / 105) * data.measure)
            );
        });

        this.prevMelodyVolume = avgMelodyVolume;
      }

      /*
       * FIREFLIES
       */

      const flyAmount = 0.3;
      const flightNoise = 0.01;

      (this.subjects.fireflies as THREE.Group).children.forEach((fly) => {
        if (fly.userData.state === "off" && Math.random() < 0.0005) {
          fly.userData.state = "lighting";
          fly.userData.flightPath = new THREE.Vector3(
            -0.5 + Math.random(),
            -0.5 + Math.random(),
            -0.5 + Math.random()
          );
        }

        if (fly.userData.state === "lighting") {
          fly.userData.cycle += 0.1;
          if (fly.userData.cycle >= 1) {
            fly.userData.state = "dimming";
          }
        }

        if (fly.userData.state === "dimming") {
          fly.userData.cycle -= 0.025;
          if (fly.userData.cycle <= 0) {
            fly.userData.state = "off";
          }
        }

        if (
          fly.userData.state === "dimming" ||
          fly.userData.state === "lighting"
        ) {
          const flightPath = fly.userData.flightPath as THREE.Vector3;
          const newX = Math.min(
            Math.max(
              fly.position.x +
                (flightPath.x + (flightNoise / -2 + flightNoise)) * flyAmount,
              -70
            ),
            140
          );
          const newY = Math.min(
            Math.max(
              fly.position.y +
                (flightPath.x + (flightNoise / -2 + flightNoise)) * flyAmount,
              5
            ),
            20
          );
          const newZ = Math.min(
            Math.max(
              fly.position.z +
                (flightPath.x + (flightNoise / -2 + flightNoise)) * flyAmount,
              -20
            ),
            70
          );
          fly.position.set(newX, newY, newZ);
        }

        (fly.children[0] as THREE.PointLight).intensity =
          fly.userData.cycle / 2;
        (
          (fly.children[1] as THREE.Mesh).material as THREE.MeshBasicMaterial
        ).opacity = fly.userData.cycle;
      });

      this.renderer.render(this.scene, this.camera);
    }
  }
}
