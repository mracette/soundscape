import chroma from "chroma-js";
import { boundedSin } from "crco-utils";

const cycle = 2;
const bSin = boundedSin(cycle, 0, 1);
const intense = 15;
let acc = 0;

export const renderFlowers = (subjects, analyser, extras) => {
  analyser.getFrequencyData();
  const vol =
    analyser.fftData.reduce((a, b) => a + b) / analyser.fftData.length / 255;
  if (vol > 0) {
    acc += vol;
    subjects.flowers.forEach((flower, i) => {
      const mod =
        vol *
        intense *
        bSin(extras.beats + acc + cycle * (i / subjects.flowers.length));
      flower.material.color.set(
        chroma
          .mix(extras.colors.darkFlower, extras.colors.flower, mod, "rgb")
          .hex()
      );
    });
  }
};
