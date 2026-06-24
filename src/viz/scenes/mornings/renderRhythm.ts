import * as THREE from "three";
import { Analyser } from "../../../classes/Analyser";
import { boundedSin } from "../../../utils/mathUtils";

const period = 2;
const bSin = boundedSin(period, 0.2, 0.3);

interface RhythmExtras {
  beats: number;
  spectrumFunction: (n: number) => string;
}

export const renderRhythm = (
  subjects: THREE.Mesh[][][],
  analyser: Analyser,
  extras: RhythmExtras
) => {
  analyser.getFrequencyBuckets();

  for (let i = 0; i < subjects.length; i++) {
    const col = subjects[i];

    for (let j = 0; j < col.length; j++) {
      const row = col[j];

      for (let k = 0; k < row.length; k++) {
        const mod = ((i + k) % 4) / 4;
        const p = bSin(extras.beats + (mod * period) / 4);
        const book = row[k];
        (book.material as THREE.MeshLambertMaterial).emissiveIntensity =
          (p * analyser.bucketData[j]) / 255;
      }
    }
  }
};
