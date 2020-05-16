import chroma from "chroma-js";
import { COLORS } from "./Swamp";

const intense = 5;

export const renderShrooms = (subjects, analyser, extras) => {
  analyser.getFrequencyData();
  const vol =
    analyser.fftData.reduce((a, b) => a + b) / analyser.fftData.length / 255;
  if (vol > 0) {
    subjects.shrooms.forEach((shroom) => {
      shroom.mesh.material.color.set(
        chroma
          .mix(COLORS.black, shroom.baseColor, 0.5 + vol * intense, "rgb")
          .hex()
      );
    });
  }
};
