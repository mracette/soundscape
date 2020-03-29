import { boundedSin } from "crco-utils";

const period = 2;
const bSin = boundedSin(period, 0.2, 0.3);

export const renderRhythm = (subjects, analyser, extras) => {
  analyser.getFrequencyBuckets();

  for (let i = 0; i < subjects.length; i++) {
    const col = subjects[i];

    for (let j = 0; j < col.length; j++) {
      const row = col[j];

      for (let k = 0; k < row.length; k++) {
        const mod = ((i + k) % 4) / 4;
        const p = bSin(extras.beats + (mod * period) / 4);
        const book = row[k];
        book.material.emissiveIntensity = (p * analyser.bucketData[j]) / 255;
      }
    }
  }
};
