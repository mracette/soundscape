import chroma from "chroma-js";
import { COLORS } from "./Swamp";
import { boundedSin } from "../../../utils/mathUtils";
import { averageVolume } from "../../../utils/audioUtils";
import * as d3 from "d3-ease";
import { Analyser } from "../../../classes/Analyser";
import * as THREE from "three-legacy";

const intense = 5;
const period = 1;
const bSin = boundedSin(period, 0, 1);
// easeQuad is not in the d3-ease shim (maps to easeQuadInOut at runtime)
const ease = (n: number) => d3.easeQuad(n);

interface Shroom {
  mesh: THREE.Mesh;
  baseColor: string;
}

interface ShroomsSubjects {
  shrooms: Shroom[];
}

interface ShroomsExtras {
  beats: number;
}

export const renderShrooms = (
  subjects: ShroomsSubjects,
  analyser: Analyser,
  extras: ShroomsExtras
) => {
  analyser.getFrequencyData();
  const fftData = analyser.fftData as Uint8Array;
  const vol = averageVolume(fftData);
  if (vol > 0) {
    subjects.shrooms.forEach((shroom, index) => {
      const mod = bSin(extras.beats + (index % 2 === 0 ? period / 2 : 0));
      (shroom.mesh.material as THREE.MeshBasicMaterial).color.set(
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
