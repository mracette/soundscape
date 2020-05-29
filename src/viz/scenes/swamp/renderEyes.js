import * as THREE from "three";
import chroma from "chroma-js";
import { COLORS } from "./Swamp";

const period = 4;

export const renderEyes = (subjects, analyser, extras) => {
  const n = subjects.eyes.length;
  for (let i = 0; i < n; i++) {
    const active = (extras.beats + i) % period > 0.13;
    const eyes = subjects.eyes[i];
    eyes.material.color = new THREE.Color(
      chroma
        .mix(
          eyes.material.userData.baseColor,
          COLORS.black,
          active ? 0 : 1,
          "rgb"
        )
        .hex()
    );
  }
};
