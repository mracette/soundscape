import * as THREE from 'three';
import { boundedSin } from 'crco-utils';

const WHITE = new THREE.Color(0xffffff);
const GREEN = new THREE.Color(0x7B9E53);
const bSin = boundedSin(4, 0, 1);

// const base = bSin(extras.beats - 4 * i / subjects.length);

export const renderHarmony = (subjects, analyser, extras) => {

    const data = analyser.getFrequencyData();

    for (let i = 0; i < subjects.leaves.length; i++) {
        const fIndex = analyser.binMin + Math.round((i / subjects.leaves.length) * (analyser.binMax - analyser.binMin));
        subjects.leaves[i].material.emissiveIntensity = data[fIndex] / 255;
    }

    for (let i = 0; i < subjects.stickLeaves.length; i++) {
        const fIndex = analyser.binMin + Math.round((i / subjects.stickLeaves.length) * (analyser.binMax - analyser.binMin));
        subjects.stickLeaves[i].material.emissiveIntensity = data[fIndex] / 255;
    }

    for (let i = 0; i < subjects.stickLeavesOne.length; i++) {
        const fIndex = analyser.binMin + Math.round((i / subjects.stickLeavesOne.length) * (analyser.binMax - analyser.binMin));
        subjects.stickLeavesOne[i].material.emissiveIntensity = data[fIndex] / 255;
    }

}