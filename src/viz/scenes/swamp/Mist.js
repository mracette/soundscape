import * as THREE from "three";
import { rgbaVertexLarge, rgbaFragment } from "../../shaders/rgba";

const COUNT = 1000;
const INTENSITY = 1;
const BOUNDS = {
  x: [-50, 50],
  y: [-5, 5],
  z: [0, 0],
};

const RANGES = {
  x: BOUNDS.x[1] - BOUNDS.x[0],
  y: BOUNDS.y[1] - BOUNDS.y[0],
  z: BOUNDS.z[1] - BOUNDS.z[0],
};

export class Mist {
  constructor(scene) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const intensities = [];
    const orientations = [];
    const colors = [];
    for (let i = 0; i < COUNT; i++) {
      const x = BOUNDS.x[0] + Math.random() * (BOUNDS.x[1] - BOUNDS.x[0]);
      const y = BOUNDS.y[0] + Math.random() * (BOUNDS.y[1] - BOUNDS.y[0]);
      const z = BOUNDS.z[0] + Math.random() * (BOUNDS.z[1] - BOUNDS.z[0]);
      positions.push(x, y, z);
      intensities.push(1);
      orientations.push(
        (x + RANGES.x / 2) / RANGES.x,
        (y + RANGES.y / 2) / RANGES.y
      );
      colors.push(Math.random(), Math.random(), Math.random(), 1);
    }
    geometry.addAttribute("position", new THREE.Float32Attribute(positions, 3));
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
    this.mist.translateZ(10);
    this.mist.geometry.attributes.position.needsUpdate = true;
    scene.add(this.mist);
  }

  render(analyser) {
    analyser.getTimeData();
    const orientations = this.mist.geometry.attributes.orientation.array;
    const colors = this.mist.geometry.attributes.customColor.array;
    for (let index = 0; index < COUNT; index++) {
      const ox = orientations[index * 2];
      const oy = orientations[index * 2 + 1];
      const ix = Math.floor(ox * analyser.fftSize);
      const vol = analyser.timeData[ix] / 256.0;
      // const bright = 2 * (0.5 - Math.abs(oy - vol));
      // const dist = 2 * (0.5 - Math.abs(0.5 - oy));
      const bright = 1 - Math.abs(oy - vol);
      //console.log(oy, dist);
      colors[index * 4 + 3] = bright * INTENSITY;
      //   colors[index * 4] = Math.random();
      //   colors[index * 4 + 1] = Math.random();
      //   colors[index * 4 + 2] = Math.random();
      //   colors[index * 4 + 3] = Math.random();
    }
    this.mist.geometry.attributes.customColor.needsUpdate = true;
  }
}
