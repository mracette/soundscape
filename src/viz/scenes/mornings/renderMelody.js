import * as THREE from 'three';
import { boundedSin } from 'crco-utils';

const w = 64 + 1;
const grey = new THREE.Color(0x333333);
const period = 4;
const bSin = boundedSin(period, .4, 1);

export const renderMelody = (subjects, analyser, extras) => {

    const data = analyser.getFrequencyData();
    const leftColors = subjects.leftPage.geometry.attributes.customColor;
    const rightColors = subjects.rightPage.geometry.attributes.customColor;

    for (let i = 0, count = leftColors.count; i < count; i++) {

        const y = i % w;
        const x = Math.floor(i / w);
        const s = bSin(extras.beats - (x / w) * (y / w) * period);
        const c = grey.clone().lerp(
            new THREE.Color(extras.spectrumFunction(1 - (y / w))),
            data[Math.ceil(y)] / 255
        );

        if (y % 4 === 0) {
            leftColors.array[i * 4] = c.r;
            leftColors.array[i * 4 + 1] = c.g;
            leftColors.array[i * 4 + 2] = c.b;
            leftColors.array[i * 4 + 3] = 1 * s;
        } else {
            leftColors.array[i * 4] = c.r;
            leftColors.array[i * 4 + 1] = c.g;
            leftColors.array[i * 4 + 2] = c.b;
            leftColors.array[i * 4 + 3] = 0;
        }

        if (y % 4 === 0) {
            rightColors.array[i * 4] = c.r;
            rightColors.array[i * 4 + 1] = c.g;
            rightColors.array[i * 4 + 2] = c.b;
            rightColors.array[i * 4 + 3] = 1 * s;
        } else {
            rightColors.array[i * 4] = c.r;
            rightColors.array[i * 4 + 1] = c.g;
            rightColors.array[i * 4 + 2] = c.b;
            rightColors.array[i * 4 + 3] = 0;
        }

    }

    leftColors.needsUpdate = true;
    rightColors.needsUpdate = true;

}