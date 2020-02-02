import * as THREE from 'three';

const w = 32 + 1;
const h = 32 + 1;

export const renderMelody = (subjects, analyser, extras) => {

    // const data = analyser.getFrequencyData();
    const leftColors = subjects.leftPage.geometry.attributes.customColor;
    //const rightColors = subjects.rightPage.geometry.attributes.customColor;

    for (let i = 0, count = leftColors.count; i < count; i++) {

        const y = i % w;
        const x = Math.floor(i / h);
        const c = new THREE.Color(extras.spectrumFunction((y / h)));

        if (y % 2 === 0) {
            // const c = new THREE.Color(extras.spectrumFunction(Math.random()));
            leftColors.array[i * 4] = c.r;
            leftColors.array[i * 4 + 1] = c.g;
            leftColors.array[i * 4 + 2] = c.b;
            leftColors.array[i * 4 + 3] = 1;
        } else {
            leftColors.array[i * 4] = c.r;
            leftColors.array[i * 4 + 1] = c.g;
            leftColors.array[i * 4 + 2] = c.b;
            leftColors.array[i * 4 + 3] = 0;
        }

    }

    leftColors.needsUpdate = true;
    //rightColors.needsUpdate = true;

}