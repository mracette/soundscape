import * as THREE from 'three';

const WHITE = new THREE.Color(0xffffff);

export const renderRhythm = (subjects, analyser, extras) => {

    const freqData = analyser.getFrequencyData();
    const freqDataBins = [0, 0, 0, 0, 0];
    const freqDataCounts = [0, 0, 0, 0, 0];

    for (let i = 0, n = analyser.frequencyBinCount; i < n; i++) {

        const binNum = Math.floor(i * freqDataBins.length / n);
        const normalized = analyser.aWeights[i] * freqData[i] / 255;
        freqDataBins[binNum] += normalized;
        freqDataCounts[binNum] += 1;

    }

    for (let i = 0; i < freqDataBins.length; i++) {

        freqDataBins[i] = freqDataBins[i] / freqDataCounts[i];

    }

    for (let i = 0; i < subjects.length; i++) {

        const col = subjects[i];

        for (let j = 0; j < col.length; j++) {

            const row = col[j];

            for (let k = 0; k < row.length; k++) {

                const book = row[k];
                book.material.emissiveIntensity = freqDataBins[j];

            }

        }

    }

}