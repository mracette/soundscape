import chroma from "chroma-js";
import { boundedSin, clamp } from "crco-utils";
import { COLORS } from "./Swamp";

const bSin = boundedSin(8, 0, 1);
const intense = 1.25;

let prev = null;
let acc = 0;

export const renderHut = (subjects, analyser, extras) => {
  analyser.getFrequencyData();
  const vol =
    analyser.fftData.reduce((a, b) => a + b) / analyser.fftData.length / 255;
  if (vol > 0) {
    acc += vol;
    const cycle = bSin(extras.beats + acc * 5);
    const asc = cycle > prev;
    const pos = Math.min(
      extras.colors.length - 1,
      Math.floor(cycle * extras.colors.length)
    );
    let posTwo =
      pos === 0
        ? pos + 1
        : pos === extras.colors.length - 1
        ? pos - 1
        : pos + (asc ? 1 : -1);

    const colorOne = extras.colors[pos];
    const colorTwo = extras.colors[posTwo];
    const boundOne = (1 / extras.colors.length) * pos;
    const boundTwo = (1 / extras.colors.length) * posTwo;
    const ratio = Math.abs(
      clamp((cycle - boundOne) / (boundTwo - boundOne), 0, 1)
    );
    const mixed = chroma.mix(colorOne, colorTwo, ratio, "rgb").hex();
    subjects.light.color.set(mixed);
    subjects.light.intensity = vol * 10000 * intense;
    subjects.hut.material.color.set(
      chroma.mix(COLORS.moonYellow, mixed, vol * 11.5 * intense, "rgb").hex()
    );
    subjects.background.material.color.set(
      chroma.mix("#000000", mixed, vol * 2.5 * intense, "rgb").hex()
    );

    prev = cycle;
  }
};
