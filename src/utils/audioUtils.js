import { solveExpEquation } from "./mathUtils";

export const getPathToAudio = (id, name, format, debug = false) => {
  const ext = format === "wav" ? "wav" : "mp3";

  if (import.meta.env.REACT_APP_ASSET_LOCATION === "local") {
    const path = `${import.meta.env.BASE_URL}audio/${format}/${id}/${name}.${ext}`;
    debug && console.log(path);
    return path;
  } else if (import.meta.env.REACT_APP_ASSET_LOCATION === "cloudfront") {
    const path = `${import.meta.env.REACT_APP_ASSET_DOMAIN}/app/audio/${format}/${id}/${name}.${ext}`;
    debug && console.log(path);
    return path;
  }
};

export const nextSubdivision = (audioCtx, bpm, beats) => {
  const timeElapsed = audioCtx.currentTime;
  const beatsElapsed = timeElapsed / (60 / bpm);
  const subdivisionsElapsed = Math.floor(beatsElapsed / beats);
  const nextSubdivision = (subdivisionsElapsed + 1) * beats * (60 / bpm);

  return nextSubdivision;
};

// effects chain parameters
export const effectParams = {
  lpFilter: {
    minFreq: 320,
    maxFreq: 20000,
    minQ: 0.71,
    maxQ: 3,
    expFreqParams: solveExpEquation(1, 320, 100, 20000),
    expQParams: solveExpEquation(1, 0.71, 100, 3),
  },
  hpFilter: {
    minFreq: 20,
    maxFreq: 4500,
    minQ: 0.71,
    maxQ: 1.5,
    expFreqParams: solveExpEquation(1, 20, 100, 4500),
    expQParams: solveExpEquation(1, 0.71, 100, 1.5),
  },
  ambience: {
    minWet: 0,
    maxWet: 0.55,
  },
};

export const initGain = (audioCtx, gain) => {
  const a = audioCtx.createGain();
  a.gain.value = gain;
  return a;
};

export const initLowpass = (audioCtx) => {
  const a = audioCtx.createBiquadFilter();
  a.type = "lowpass";
  a.frequency.value = 20000;
  a.Q.value = 0.71;
  return a;
};

export const initHighpass = (audioCtx) => {
  const a = audioCtx.createBiquadFilter();
  a.type = "highpass";
  a.frequency.value = 20000;
  a.Q.value = 0.71;
  return a;
};

export const loadArrayBuffer = (audioFilePath) => {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.responseType = "arraybuffer";
    request.addEventListener("load", () => {
      if (request.status === 200) {
        resolve(request.response);
      }
    });
    request.addEventListener("error", (err) => {
      reject(err);
    });
    request.open("GET", audioFilePath, true);
    request.send();
  });
};

export const createAudioPlayer = (audioCtx, audioFilePath, options = {}) => {
  const fade = options.fade || false;
  const fadeLength = options.fadeLength || null;
  const fadeType = options.fadeType || "exponential";
  const offlineRendering = options.offlineRendering || false;
  const logLevel = options.logLevel || "none";
  return new Promise((resolve, reject) => {
    loadArrayBuffer(audioFilePath)
      .then((arrayBuffer) => {
        audioCtx.decodeAudioData(
          arrayBuffer,
          function (buffer) {
            if (offlineRendering) {
              const bufferLength = options.renderLength || buffer.length;
              const bufferDuration = bufferLength / buffer.sampleRate;
              const offline = new (window.OfflineAudioContext ||
                window.webkitOfflineAudioContext)(2, bufferLength, buffer.sampleRate);

              offline.oncomplete = (event) => {
                const { renderedBuffer } = event;
                logLevel === "debug" && console.log(renderedBuffer);
                const audioPlayer = audioCtx.createBufferSource();
                audioPlayer.buffer = renderedBuffer;
                resolve(audioPlayer);
              };

              const gainNode = offline.createGain();
              const offlineBuffer = offline.createBufferSource();
              offlineBuffer.buffer = buffer;
              offlineBuffer.connect(gainNode);
              gainNode.connect(offline.destination);

              if (fade) {
                gainNode.gain.setValueAtTime(0.001, offline.currentTime);
                gainNode.gain.setValueAtTime(
                  1,
                  offline.currentTime + bufferDuration - fadeLength
                );

                if (fadeType === "exponential") {
                  gainNode.gain.exponentialRampToValueAtTime(
                    1,
                    offline.currentTime + fadeLength
                  );
                  gainNode.gain.exponentialRampToValueAtTime(
                    0.001,
                    offline.currentTime + bufferDuration
                  );
                } else if (fadeType === "linear") {
                  gainNode.gain.linearRampToValueAtTime(
                    1,
                    offline.currentTime + fadeLength
                  );
                  gainNode.gain.linearRampToValueAtTime(
                    0.001,
                    offline.currentTime + bufferDuration
                  );
                }
              }

              offlineBuffer.start();
              offline.startRendering();
            } else {
              const audioPlayer = audioCtx.createBufferSource();
              audioPlayer.buffer = buffer;
              resolve(audioPlayer);
            }
          },
          (err) => {
            logLevel === "debug" && console.error(err);
            reject(err);
          }
        );
      })
      .catch((err) => {
        logLevel === "debug" && console.error(err);
        reject(err);
      });
  });
};
