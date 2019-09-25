export const createAudioPlayer = (audioCtx, audioFilePath) => {

    return new Promise((resolve, reject) => {
        
        loadArrayBuffer(audioFilePath).then((arrayBuffer) => {
            
            audioCtx.decodeAudioData(arrayBuffer, (audioBuffer) => {
                
                const audioPlayer = audioCtx.createBufferSource();
                audioPlayer.buffer = audioBuffer;
                
                resolve(audioPlayer);
                
            }, (err) => {
                
                console.error(err);
                reject(err);
                
            })
            
        }).catch((err) => {
            
            console.error(err);
            reject(err);
            
        })

    })
        
}

export const loadArrayBuffer = (audioFilePath, callback) => {

    return new Promise((resolve, reject) => {

        const request = new XMLHttpRequest();
        
        request.responseType = "arraybuffer";
        
        request.addEventListener('load', () => {
            if(request.status === 200) {
                resolve(request.response);
            }
        })
        
        request.addEventListener('error', (err) => {
            reject(err);
        })
        
        request.open('GET', audioFilePath, true);
        request.send();

    });

}

export const nextSubdivision = (audioCtx, audioCtxInitTime, bpm, beats) => {

    const timeElapsed = audioCtx.currentTime - audioCtxInitTime;
    const beatsElapsed = timeElapsed / ( 60 / bpm );
    const subdivisionsElapsed = Math.floor(beatsElapsed / beats);
    const nextSubdivision = audioCtxInitTime + (subdivisionsElapsed + 1) * beats * (60/bpm);

    return nextSubdivision;

}