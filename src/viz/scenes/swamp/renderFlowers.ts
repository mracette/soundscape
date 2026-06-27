import chroma from "chroma-js";
import { boundedSin } from "../../../utils/mathUtils";
import { averageVolume } from "../../../utils/audioUtils";
import { Analyser } from "../../../classes/Analyser";
import * as THREE from "three";

const cycle = 2;
const bSin = boundedSin(cycle, 0, 1);
const intense = 15;
let acc = 0;

interface FlowerColors {
  flower: string;
  darkFlower: string;
}

interface FlowersSubjects {
  flowers: THREE.Mesh[];
}

interface FlowersExtras {
  beats: number;
  colors: FlowerColors;
}

export const renderFlowers = (
  subjects: FlowersSubjects,
  analyser: Analyser,
  extras: FlowersExtras
) => {
  analyser.getFrequencyData();
  const fftData = analyser.fftData as Uint8Array;
  const vol = averageVolume(fftData);
  if (vol > 0) {
    acc += vol;
    subjects.flowers.forEach((flower, i) => {
      const mod =
        vol *
        intense *
        bSin(extras.beats + acc + cycle * (i / subjects.flowers.length));
      (flower.material as THREE.MeshBasicMaterial).color.set(
        (chroma as any)
          .mix(extras.colors.darkFlower, extras.colors.flower, mod, "rgb")
          .hex()
      );
    });
  }
};
