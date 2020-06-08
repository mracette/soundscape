import chroma from "chroma-js";
import { COLORS } from "./Swamp";
import { boundedSin } from "crco-utils";
import * as d3 from "d3-ease";

const intense = 5;
const period = 1;
const bSin = boundedSin(period, 0, 1);
const ease = (n) => d3.easeQuad(n);

export const renderShrooms = (subjects, analyser, extras) => {
  analyser.getFrequencyData();
  const vol =
    analyser.fftData.reduce((a, b) => a + b) / analyser.fftData.length / 255;
  if (vol > 0) {
    subjects.shrooms.forEach((shroom, index) => {
      const mod = bSin(extras.beats + (index % 2 === 0 ? period / 2 : 0));
      shroom.mesh.material.color.set(
        chroma
          .mix(
            COLORS.black,
            shroom.baseColor,
            0.45 + ease(mod * vol * intense),
            "rgb"
          )
          .hex()
      );
    });
  }
};
