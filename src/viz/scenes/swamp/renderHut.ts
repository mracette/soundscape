import chroma from "chroma-js";
import { boundedSin, clamp } from "../../../utils/mathUtils";
import { averageVolume } from "../../../utils/audioUtils";
import { COLORS } from "./Swamp";
import { Analyser } from "../../../classes/Analyser";
import * as THREE from "three";

const bSin = boundedSin(8, 0, 1);
const intense = 1.25;

let prev: number | null = null;
let acc = 0;

interface HutSubjects {
  light: THREE.Light;
  hut: THREE.Mesh;
  background: THREE.Mesh;
}

interface HutExtras {
  beats: number;
  colors: string[];
}

export const renderHut = (
  subjects: HutSubjects,
  analyser: Analyser,
  extras: HutExtras
) => {
  analyser.getFrequencyData();
  const fftData = analyser.fftData as Uint8Array;
  const vol = averageVolume(fftData);
  if (vol > 0) {
    acc += vol;
    const cycle = bSin(extras.beats + acc * 5);
    const asc = cycle > (prev ?? cycle);
    const pos = Math.min(
      extras.colors.length - 1,
      Math.floor(cycle * extras.colors.length)
    );
    const posTwo =
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
    const mixed = (chroma as any).mix(colorOne, colorTwo, ratio, "rgb").hex();
    subjects.light.color.set(mixed);
    subjects.light.intensity = vol * 10000 * intense;
    (subjects.hut.material as THREE.MeshBasicMaterial).color.set(
      (chroma as any).mix(COLORS.moonYellow, mixed, vol * 11.5 * intense, "rgb").hex()
    );
    (subjects.background.material as THREE.MeshBasicMaterial).color.set(
      (chroma as any).mix("#000000", mixed, vol * 2.5 * intense, "rgb").hex()
    );

    prev = cycle;
  }
};
