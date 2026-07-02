import { bakeSignal, type BakeResult } from "../bake/bakeSignal";
import { normalizeToPeak, toMono } from "../bake/bakeUtils";
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
  result.frames = normalizeToPeak(result.frames);
  return result;
};
window.__bakeReady = true;
