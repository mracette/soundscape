import * as THREE from 'three';

const WHITE = new THREE.Color(0xffffff);

export const renderRhythm = (subjects, analyser, extras) => {

    const freqData = analyser.getFrequencyBuckets();

    for (let i = 0; i < subjects.length; i++) {

        const col = subjects[i];

        for (let j = 0; j < col.length; j++) {

            const row = col[j];

            for (let k = 0; k < row.length; k++) {

                const book = row[k];
                book.material.emissiveIntensity = (0.35 * freqData[j]) / 255;

            }

        }

    }

}