import * as THREE from "three";
import * as d3 from "d3-ease";
import chroma from "chroma-js";
import { lerp, gaussianRand, boundedSin } from "crco-utils";
import { rgbaVertexLarge, rgbaFragment } from "../../shaders/rgba";

const COUNT = 250;
const INTENSITY = 5;
const BOUNDS = {
  x: [-50, 50],
  y: [-10, 10],
  z: [-10, 10],
};

const RANGES = {
  x: BOUNDS.x[1] - BOUNDS.x[0],
  y: BOUNDS.y[1] - BOUNDS.y[0],
  z: BOUNDS.z[1] - BOUNDS.z[0],
};

const BSIN = boundedSin(2, -1, 1);

export class Mist {
  constructor(scene, analyser, extras) {
    this.analyser = analyser;
    this.ease = (n) => d3.easePolyOut.exponent(5)(n);
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const intensities = [];
    const orientations = [];
    const colors = [];
    for (let i = 0; i < COUNT; i++) {
      const x = BOUNDS.x[0] + Math.random() * (BOUNDS.x[1] - BOUNDS.x[0]);
      const y =
        BSIN(x) + BOUNDS.y[0] + gaussianRand() * (BOUNDS.y[1] - BOUNDS.y[0]);
      const z =
        BSIN(x) + BOUNDS.z[0] + gaussianRand() * (BOUNDS.z[1] - BOUNDS.z[0]);
      positions.push(x, y, z);
      intensities.push(1);
      const ox = (x + RANGES.x / 2) / RANGES.x;
      const oy = (y + RANGES.y / 2) / RANGES.y;
      orientations.push(ox, oy);
      const color = new THREE.Color(chroma(extras.spectrumFunction(ox)).hex());
      colors.push(color.r, color.g, color.b, 1);
    }
    geometry.addAttribute("position", new THREE.Float32Attribute(positions, 3));
    geometry.addAttribute(
      "initialPosition",
      new THREE.Float32Attribute(positions, 3)
    );
    geometry.addAttribute(
      "orientation",
      new THREE.Float32Attribute(orientations, 1)
    );
    geometry.addAttribute(
      "customColor",
      new THREE.Float32BufferAttribute(colors, 4)
    );
    const material = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      vertexShader: rgbaVertexLarge,
      fragmentShader: rgbaFragment,
      vertexColors: THREE.VertexColors,
    });
    this.mist = new THREE.Points(geometry, material);
    this.mist.geometry.attributes.position.needsUpdate = true;
    scene.add(this.mist);
  }

  render() {
    this.analyser.getTimeData();
    for (let index = 0; index < COUNT; index++) {
      const ox = this.mist.geometry.attributes.orientation.array[index * 2];
      const oy = this.mist.geometry.attributes.orientation.array[index * 2 + 1];
      const ix = Math.floor(ox * this.analyser.fftSize);
      const vol = this.analyser.timeData[ix] / 256.0;
      const bright = this.ease(1 - Math.abs(oy - vol));
      this.mist.geometry.attributes.customColor.array[index * 4 + 3] =
        bright * INTENSITY * Math.abs(vol - 0.5);
      this.mist.geometry.attributes.position.array[index * 3 + 1] = lerp(
        this.mist.geometry.attributes.initialPosition.array[index * 3 + 1],
        vol,
        vol * 0.5
      );
    }
    this.mist.rotateX(0.01);
    this.mist.geometry.attributes.position.needsUpdate = true;
    this.mist.geometry.attributes.customColor.needsUpdate = true;
  }
}
