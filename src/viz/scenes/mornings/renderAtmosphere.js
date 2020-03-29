import { boundedSin } from "crco-utils";

const period = 4;
const bSin = boundedSin(period, 0, 2, 0, 0, true);

export const renderAtmosphere = (subjects, analyser, extras) => {
  for (let i = 0; i < subjects.length; i++) {
    const offset = (period * (i % subjects.length)) / subjects.length;
    subjects[i].material.emissiveIntensity =
      bSin(-extras.beats + offset) * (extras.enabled ? 0.25 : 0);
  }
};
