import * as THREE from "three";
import { Analyser } from "../../../classes/Analyser";

interface HarmonySubjects {
  leaves: THREE.Mesh[];
  stickLeaves: THREE.Mesh[];
  stickLeavesOne: THREE.Mesh[];
  group?: unknown;
  box?: unknown;
}

interface HarmonyExtras {
  beats: number;
}

export const renderHarmony = (
  subjects: HarmonySubjects,
  analyser: Analyser,
  _extras: HarmonyExtras
) => {
  analyser.getFrequencyData();

  const fftData = analyser.fftData as Uint8Array;

  for (let i = 0; i < subjects.leaves.length; i++) {
    const fIndex =
      analyser.binMin +
      Math.round(
        (i / subjects.leaves.length) * (analyser.binMax - analyser.binMin)
      );
    (subjects.leaves[i].material as THREE.MeshLambertMaterial).emissiveIntensity =
      fftData[fIndex] / 255;
  }

  for (let i = 0; i < subjects.stickLeaves.length; i++) {
    const fIndex =
      analyser.binMin +
      Math.round(
        (i / subjects.stickLeaves.length) * (analyser.binMax - analyser.binMin)
      );
    (subjects.stickLeaves[i].material as THREE.MeshLambertMaterial).emissiveIntensity =
      fftData[fIndex] / 255;
  }

  for (let i = 0; i < subjects.stickLeavesOne.length; i++) {
    const fIndex =
      analyser.binMin +
      Math.round(
        (i / subjects.stickLeavesOne.length) *
          (analyser.binMax - analyser.binMin)
      );
    (subjects.stickLeavesOne[i].material as THREE.MeshLambertMaterial).emissiveIntensity =
      fftData[fIndex] / 255;
  }
};
