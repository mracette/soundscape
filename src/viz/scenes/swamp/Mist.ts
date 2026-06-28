import * as THREE from "three-legacy";
import * as d3 from "d3-ease";
import chroma from "chroma-js";
import { lerp, gaussianRand, boundedSin } from "../../../utils/mathUtils";
import { rgbaVertexLarge, rgbaFragment } from "../../shaders/rgba";
import { Analyser } from "../../../classes/Analyser";

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

interface MistExtras {
  spectrumFunction: (n: number) => string;
}

export class Mist {
  analyser: Analyser;
  ease: (n: number) => number;
  mist: THREE.Points;

  constructor(scene: THREE.Scene, analyser: Analyser, extras: MistExtras) {
    this.analyser = analyser;
    this.ease = (n) => d3.easePolyOut.exponent(5)(n);
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const intensities: number[] = [];
    const orientations: number[] = [];
    const colors: number[] = [];
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
      // chroma-js shim types as any; calls are safe at runtime
      const color = new THREE.Color(chroma(extras.spectrumFunction(ox)).hex());
      colors.push(color.r, color.g, color.b, 1);
    }
    // THREE.Float32Attribute is a legacy r108 alias for Float32BufferAttribute; typed in @types/three
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
    (geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    scene.add(this.mist);
  }

  render() {
    this.analyser.getTimeData();
    const timeData = this.analyser.timeData as Uint8Array;
    const geo = this.mist.geometry as THREE.BufferGeometry;
    const orientationArray = geo.attributes.orientation.array;
    const colorArray = geo.attributes.customColor.array as Float32Array;
    const posArray = geo.attributes.position.array as Float32Array;
    const initPosArray = geo.attributes.initialPosition.array;
    for (let index = 0; index < COUNT; index++) {
      const ox = orientationArray[index * 2];
      const oy = orientationArray[index * 2 + 1];
      const ix = Math.floor(ox * this.analyser.fftSize);
      const vol = timeData[ix] / 256.0;
      const bright = this.ease(1 - Math.abs(oy - vol));
      colorArray[index * 4 + 3] =
        bright * INTENSITY * Math.abs(vol - 0.5);
      posArray[index * 3 + 1] = lerp(
        initPosArray[index * 3 + 1],
        vol,
        vol * 0.5
      );
    }
    this.mist.rotateX(0.01);
    (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (geo.attributes.customColor as THREE.BufferAttribute).needsUpdate = true;
  }
}
