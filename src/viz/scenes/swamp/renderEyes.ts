import * as THREE from "three-legacy";
import chroma from "chroma-js";
import { COLORS } from "./Swamp";
import { Analyser } from "../../../classes/Analyser";

const period = 4;

interface EyesSubjects {
  eyes: THREE.Mesh[];
}

interface EyesExtras {
  beats: number;
}

export const renderEyes = (
  subjects: EyesSubjects,
  analyser: Analyser,
  extras: EyesExtras
) => {
  const n = subjects.eyes.length;
  for (let i = 0; i < n; i++) {
    const active = (extras.beats + i) % period > 0.13;
    const eyes = subjects.eyes[i];
    (eyes.material as THREE.MeshBasicMaterial).color = new THREE.Color(
      chroma
        .mix(
          (eyes.material as THREE.MeshBasicMaterial).userData.baseColor,
          COLORS.black,
          active ? 0 : 1,
          "rgb"
        )
        .hex()
    );
  }
};
