import { bakeSignal, type BakeResult } from "../bake/bakeSignal";
import { snappifyFrames } from "../bake/snappify";

interface BakeAudioOpts {
  analyserConfig: Record<string, unknown>;
  fps: number;
  numBuckets: number;
  band: string;
  sampleRate: number;
  snappy?: { coef: number; leadFrames: number };
}

declare global {
  interface Window {
    __bakeReady?: boolean;
    __bakeAudio?: (b64: string, opts: BakeAudioOpts) => Promise<BakeResult>;
  }
}

function toMono(buf: AudioBuffer): Float32Array {
  const n = buf.length;
  if (buf.numberOfChannels === 1) return buf.getChannelData(0).slice();
  const out = new Float32Array(n);
  for (let c = 0; c < buf.numberOfChannels; c++) {
    const data = buf.getChannelData(c);
    for (let i = 0; i < n; i++) out[i] += data[i];
  }
  for (let i = 0; i < n; i++) out[i] /= buf.numberOfChannels;
  return out;
}

window.__bakeAudio = async (b64, opts) => {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  // decodeAudioData resamples to the context's sampleRate, so decode at the
  // same rate the bake will render at.
  const decodeCtx = new OfflineAudioContext(1, 1, opts.sampleRate);
  const audio = await decodeCtx.decodeAudioData(bytes.buffer);
  const samples = toMono(audio);
  const result = await bakeSignal({
    samples,
    sampleRate: audio.sampleRate,
    analyserConfig: opts.analyserConfig,
    fps: opts.fps,
    numBuckets: opts.numBuckets,
    band: opts.band,
  });
  if (opts.snappy) {
    result.frames = snappifyFrames(result.frames, opts.snappy);
  }
  return result;
};
window.__bakeReady = true;
