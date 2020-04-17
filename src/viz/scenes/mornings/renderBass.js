import * as d3 from "d3-ease";

const VOL_COEF = 0.0003;
const MAX_OPACITY = 0.15;
const MIN_OPACITY = 0.025;
const MAX_SUN = 0.7;
const MIN_SUN = 0.25;

export const renderBass = (subjects, analyser, extras) => {
  let volume = 0;

  analyser.getFrequencyData();

  for (let i = 0, n = analyser.frequencyBinCount; i < n; i++) {
    volume += analyser.fftData[i];
  }

  const brightnessFactor = d3.easeQuadInOut(volume * VOL_COEF);

  subjects[0].material.opacity =
    MIN_OPACITY + brightnessFactor * (MAX_OPACITY - MIN_OPACITY);
  subjects[1].material.opacity =
    MIN_OPACITY + brightnessFactor * (MAX_OPACITY - MIN_OPACITY);
  extras.sunlight.intensity = MIN_SUN + brightnessFactor * (MAX_SUN - MIN_SUN);
};
