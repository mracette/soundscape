import * as THREE from "three-legacy";
import { Analyser } from "../../../classes/Analyser";
import { boundedSin } from "../../../utils/mathUtils";

const period = 4;
const bSin = boundedSin(period, 0, 2, 0, 0, true);

interface AtmosphereExtras {
  beats: number;
  enabled: boolean;
}

export const renderAtmosphere = (
  subjects: THREE.Mesh[],
  _analyser: Analyser,
  extras: AtmosphereExtras
) => {
  for (let i = 0; i < subjects.length; i++) {
    const offset = (period * (i % subjects.length)) / subjects.length;
    (subjects[i].material as THREE.MeshLambertMaterial).emissiveIntensity =
      bSin(-extras.beats + offset) * (extras.enabled ? 0.25 : 0);
  }
};
