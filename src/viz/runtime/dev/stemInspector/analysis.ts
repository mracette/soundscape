import { bakeSignal, type BakeResult } from "../../bake/bakeSignal";
import { normalizeToPeak } from "../../bake/bakeUtils";
import { snappifyFrames } from "../../bake/snappify";

/** Everything the knobs panel can change. `analyser` passes through to the real Analyser. */
export interface BakeSettings {
  analyser: {
    power: number;
    smoothingTimeConstant: number;
    minFrequency: number;
    maxFrequency: number;
  } & Record<string, unknown>;
  numBuckets: number;
  fps: number;
  snappy: { coef: number; leadFrames: number };
  onset: { windowFrames: number; decayPerFrame: number };
}

export const DEFAULT_SETTINGS: BakeSettings = {
  analyser: { power: 11, smoothingTimeConstant: 0.8, minFrequency: 20, maxFrequency: 16500 },
  numBuckets: 8,
  fps: 30,
  snappy: { coef: 0.5, leadFrames: 2 },
  onset: { windowFrames: 9, decayPerFrame: 0.8 },
};

export interface StemAnalysis {
  raw: BakeResult;
  snappy: BakeResult;
}

/**
 * Bake both variants the Blender pipeline produces: the plain bake with the
 * analyser's own smoothing, and the snappy bake (instantaneous FFT, zero-phase
 * smoothed + lead-shifted offline). Both are peak-normalized per channel,
 * mirroring bakeAudioHarness exactly.
 */
export async function analyzeStem(
  samples: Float32Array,
  sampleRate: number,
  s: BakeSettings
): Promise<StemAnalysis> {
  const common = { samples, sampleRate, fps: s.fps, numBuckets: s.numBuckets, onset: s.onset };
  const raw = await bakeSignal({ ...common, analyserConfig: s.analyser });
  const snappyBase = await bakeSignal({
    ...common,
    analyserConfig: { ...s.analyser, smoothingTimeConstant: 0 },
  });
  snappyBase.frames = snappifyFrames(snappyBase.frames, {
    coef: s.snappy.coef,
    leadFrames: s.snappy.leadFrames,
    onset: s.onset,
  });
  raw.frames = normalizeToPeak(raw.frames);
  snappyBase.frames = normalizeToPeak(snappyBase.frames);
  return { raw, snappy: snappyBase };
}
