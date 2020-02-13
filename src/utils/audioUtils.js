import { solveExpEquation } from './mathUtils';

export const nextSubdivision = (audioCtx, audioCtxInitTime, bpm, beats) => {

    const timeElapsed = audioCtx.currentTime - audioCtxInitTime;
    const beatsElapsed = timeElapsed / (60 / bpm);
    const subdivisionsElapsed = Math.floor(beatsElapsed / beats);
    const nextSubdivision = audioCtxInitTime + (subdivisionsElapsed + 1) * beats * (60 / bpm);

    return nextSubdivision;

}

// effects chain parameters
export const effectParams = {
    lpFilter: {
        minFreq: 320,
        maxFreq: 20000,
        minQ: 0.71,
        maxQ: 3,
        expFreqParams: solveExpEquation(1, 320, 100, 20000),
        expQParams: solveExpEquation(1, 0.71, 100, 3)
    },
    hpFilter: {
        minFreq: 20,
        maxFreq: 4500,
        minQ: 0.71,
        maxQ: 1.5,
        expFreqParams: solveExpEquation(1, 20, 100, 4500),
        expQParams: solveExpEquation(1, 0.71, 100, 1.5)
    },
    ambience: {
        minWet: 0,
        maxWet: 0.55
    }
}

export const initGain = (audioCtx, gain) => {
    const a = audioCtx.createGain();
    a.gain.value = gain;
    return a;
}

export const initLowpass = (audioCtx) => {
    const a = audioCtx.createBiquadFilter();
    a.type = 'lowpass';
    a.frequency.value = 20000;
    a.Q.value = 0.71;
    return a;
}

export const initHighpass = (audioCtx) => {
    const a = audioCtx.createBiquadFilter();
    a.type = 'highpass';
    a.frequency.value = 20000;
    a.Q.value = 0.71;
    return a;
}