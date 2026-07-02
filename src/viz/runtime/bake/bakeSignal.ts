import { Analyser } from "../../../classes/Analyser";
import { AnalyserSignalSource, type AnalyserLike } from "../signal";
import { computeOnsetStrength, frameTimes } from "./bakeUtils";

export interface BakedFrame {
  /** Mean band level, 0..1 (matches the runtime's "volume" measure). */
  volume: number;
  /** Per-bucket levels, 0..1 (matches the runtime's "bucket" measure). */
  buckets: number[];
  /** Spectral flux, 0..1 after normalization — see computeOnsetFlux. */
  onset: number;
}

export interface BakeResult {
  fps: number;
  sampleRate: number;
  durationSec: number;
  band: string;
  frames: BakedFrame[];
}

export interface BakeOptions {
  /** Mono PCM, the band's representative audio. */
  samples: Float32Array;
  sampleRate: number;
  /** Analyser config matching the runtime band (app-config `group.analyser`). */
  analyserConfig: Record<string, unknown>;
  /** Sampling rate of the baked time-series, frames per second. */
  fps: number;
  /** Number of buckets to read; sets (overrides) the analyser's bucket count. */
  numBuckets: number;
  band?: string;
}

/**
 * Bake one band's per-frame signal from `samples`, offline: render through the
 * real `Analyser` in an `OfflineAudioContext`, suspending at each frame center
 * to sample it through the runtime's own `AnalyserSignalSource` (binning,
 * averaging, and NaN-guard all reused, not reimplemented).
 *
 * Fidelity note: Web Audio's `smoothingTimeConstant` blends each FFT against the
 * previous read, so the result is only frame-for-frame comparable to a runtime
 * that reads at this same `fps`. At `smoothingTimeConstant: 0` the bake is the
 * instantaneous FFT and is cadence-independent.
 */
export async function bakeSignal(opts: BakeOptions): Promise<BakeResult> {
  const { samples, sampleRate, analyserConfig, fps, numBuckets } = opts;
  const band = opts.band ?? "band";
  const durationSec = samples.length / sampleRate;

  const ctx = new OfflineAudioContext(1, samples.length, sampleRate);

  const buffer = ctx.createBuffer(1, samples.length, sampleRate);
  buffer.copyToChannel(samples as Float32Array<ArrayBuffer>, 0);
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // The real Analyser wires input -> [gain] -> its AnalyserNode internally.
  const analyser = new Analyser(ctx as unknown as AudioContext, source, {
    ...analyserConfig,
    numBuckets,
  });
  // The analyser is a side tap; the source must reach the destination or the
  // offline render produces silence.
  source.connect(ctx.destination);

  const signal = new AnalyserSignalSource({
    [band]: analyser as unknown as AnalyserLike,
  });

  const times = frameTimes(fps, durationSec);
  const frames: BakedFrame[] = new Array(times.length);
  times.forEach((t, i) => {
    ctx
      .suspend(t)
      .then(() => {
        signal.update();
        const buckets: number[] = [];
        for (let b = 0; b < numBuckets; b++) {
          buckets.push(signal.read({ band, measure: "bucket", bucket: b }));
        }
        frames[i] = { volume: signal.read({ band, measure: "volume" }), buckets, onset: 0 };
        ctx.resume();
      })
      .catch((err) => {
        // never leave the render suspended, or startRendering() hangs with no diagnostic
        ctx.resume();
        throw err;
      });
  });

  source.start();
  await ctx.startRendering();

  const onset = computeOnsetStrength(frames);
  frames.forEach((f, i) => {
    f.onset = onset[i];
  });

  return { fps, sampleRate, durationSec, band, frames };
}
