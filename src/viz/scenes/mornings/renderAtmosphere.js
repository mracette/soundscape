import { boundedSin } from 'crco-utils';

const period = 4;
const bSin = boundedSin(period, 0, 2, 0, 0, true);

export const renderAtmosphere = (subjects, analyser, extras) => {

    const data = analyser.getFrequencyData();
    const vol = (data.reduce((a, b) => (a + b)) / data.length) / 255;
    for (let i = 0; i < subjects.length; i++) {
        const offset = period * (i % data.length) / data.length;
        subjects[i].material.emissiveIntensity = bSin(- extras.beats + offset) * vol * 1.3;
    }

}