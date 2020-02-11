export const nextSubdivision = (audioCtx, audioCtxInitTime, bpm, beats) => {

    const timeElapsed = audioCtx.currentTime - audioCtxInitTime;
    const beatsElapsed = timeElapsed / (60 / bpm);
    const subdivisionsElapsed = Math.floor(beatsElapsed / beats);
    const nextSubdivision = audioCtxInitTime + (subdivisionsElapsed + 1) * beats * (60 / bpm);

    return nextSubdivision;

}