
import * as d3 from 'd3-ease';

const VOL_COEF = .0003;
const MAX_OPACITY = .2;
const MIN_OPACITY = .025;
const MAX_SUN = 1;
const MIN_SUN = .25

export const renderBass = (subjects, analyser, extras) => {

    let volume = 0;

    const freqData = analyser.getFrequencyData();

    for (let i = 0, n = analyser.frequencyBinCount; i < n; i++) {

        volume += freqData[i];

    }

    const brightnessFactor = d3.easeQuadInOut(volume * VOL_COEF);

    subjects.materials[0].opacity = MIN_OPACITY + brightnessFactor * (MAX_OPACITY - MIN_OPACITY);
    extras.sunlight.intensity = MIN_SUN + brightnessFactor * (MAX_SUN - MIN_SUN);

}