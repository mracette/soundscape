import * as THREE from "three";
import { Analyser } from "../../../classes/Analyser";
import { boundedSin } from "../../../utils/mathUtils";
import { averageVolume } from "../../../utils/audioUtils";

const w = 64 + 1;
const grey = new THREE.Color(0x333333);
const period = 4;
const bSin = boundedSin(period, 0.4, 1);

interface MelodySubjects {
  innerPetals: THREE.Mesh[];
  outerPetals: THREE.Mesh[];
  leftPage: THREE.Mesh;
  rightPage: THREE.Mesh;
}

interface MelodyExtras {
  spectrumFunction: (n: number) => string;
  beats: number;
}

export const renderMelody = (
  subjects: MelodySubjects,
  analyser: Analyser,
  extras: MelodyExtras
) => {
  analyser.getFrequencyData();
  const fftData = analyser.fftData as Uint8Array;
  const vol = averageVolume(fftData);
  const leftColors = (subjects.leftPage.geometry as THREE.BufferGeometry)
    .attributes.customColor as THREE.BufferAttribute;
  const rightColors = (subjects.rightPage.geometry as THREE.BufferGeometry)
    .attributes.customColor as THREE.BufferAttribute;

  for (let i = 0, count = leftColors.count; i < count; i++) {
    const y = i % w;
    const x = Math.floor(i / w);
    const s = bSin(extras.beats - (x / w) * (y / w) * period);
    const c = grey
      .clone()
      .lerp(
        new THREE.Color(extras.spectrumFunction(1 - y / w)),
        fftData[Math.ceil(y)] / 255
      );

    if (y % 4 === 0) {
      (leftColors.array as Float32Array)[i * 4] = c.r;
      (leftColors.array as Float32Array)[i * 4 + 1] = c.g;
      (leftColors.array as Float32Array)[i * 4 + 2] = c.b;
      (leftColors.array as Float32Array)[i * 4 + 3] = 1 * s;
    } else {
      (leftColors.array as Float32Array)[i * 4] = c.r;
      (leftColors.array as Float32Array)[i * 4 + 1] = c.g;
      (leftColors.array as Float32Array)[i * 4 + 2] = c.b;
      (leftColors.array as Float32Array)[i * 4 + 3] = 0;
    }

    if (y % 4 === 0) {
      (rightColors.array as Float32Array)[i * 4] = c.r;
      (rightColors.array as Float32Array)[i * 4 + 1] = c.g;
      (rightColors.array as Float32Array)[i * 4 + 2] = c.b;
      (rightColors.array as Float32Array)[i * 4 + 3] = 1 * s;
    } else {
      (rightColors.array as Float32Array)[i * 4] = c.r;
      (rightColors.array as Float32Array)[i * 4 + 1] = c.g;
      (rightColors.array as Float32Array)[i * 4 + 2] = c.b;
      (rightColors.array as Float32Array)[i * 4 + 3] = 0;
    }
  }

  leftColors.needsUpdate = true;
  rightColors.needsUpdate = true;

  for (let i = 0; i < subjects.innerPetals.length; i++) {
    const s = subjects.innerPetals[i];
    (s.material as THREE.MeshLambertMaterial).emissiveIntensity = vol * 5;
  }

  for (let i = 0; i < subjects.outerPetals.length; i++) {
    const s = subjects.outerPetals[i];
    (s.material as THREE.MeshLambertMaterial).emissiveIntensity = vol * 5;
  }
};
