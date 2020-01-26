
import * as THREE from 'three';
import * as d3 from 'd3-ease';

const VOL_COEF = 1 / Math.pow(1200, 1.5);
const BOOK_COUNT = 121;
const WHITE = new THREE.Color(0xffffff);
const EASE = d3.easePolyInOut.exponent(.71);

export const renderRhythm = (subjects, analyser, extras) => {

    const freqData = analyser.getFrequencyData();
    const freqDataBins = [0, 0, 0, 0, 0];

    for (let i = 0, n = analyser.frequencyBinCount; i < n; i++) {

        freqDataBins[Math.floor(i * 5 / n)] += Math.pow(freqData[i], 2);

    }

    for (let i = 0; i < subjects.length; i++) {

        const col = subjects[i];

        for (let j = 0; j < col.length; j++) {

            const row = col[j];

            for (let k = 0; k < row.length; k++) {

                const book = row[k];
                book.material.color = book.userData.baseColor.clone().lerp(WHITE, freqDataBins[j] * VOL_COEF * EASE((j + 1) / 5));

            }

        }

    }

}