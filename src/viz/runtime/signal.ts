import { averageVolume } from "../../utils/audioUtils";
import type { Source } from "../../bindings";

/**
 * The structural subset of the legacy `Analyser` (`src/classes/Analyser.ts`)
 * the runtime relies on. Kept as an interface so tests supply a fake and the
 * runtime never imports `three-legacy`.
 */
export interface AnalyserLike {
  getFrequencyData(): void;
  getFrequencyBuckets(): void;
  fftData: Uint8Array | { left: Uint8Array; right: Uint8Array };
  bucketData: number[];
}

/** Yields a 0..1 level for a binding's source each frame. */
export interface SignalSource {
  /** Refresh any per-frame state (e.g. pull fresh FFT data). Optional. */
  update?(): void;
  read(source: Source): number;
}

/**
 * Reads live per-band `Analyser`s. Bands are keyed by name (matching
 * `source.band` — the per-song analyser groups like "bass"/"rhythm"). Call
 * `update()` once per frame to refresh every analyser, then `read()` is a cheap
 * lookup: `measure:"volume"` is the band's mean level; `measure:"bucket"` is
 * one normalized frequency bucket.
 */
let onsetWarned = false;
/** Live analysers have no onset detector; baked sources serve it (Phase 5). */
function warnOnsetOnce(): void {
  if (!onsetWarned) {
    onsetWarned = true;
    console.warn(
      'AnalyserSignalSource: measure "onset" is only available from baked signals; reading 0.'
    );
  }
}

export class AnalyserSignalSource implements SignalSource {
  constructor(private readonly bands: Record<string, AnalyserLike>) {}

  update(): void {
    for (const band of Object.values(this.bands)) {
      band.getFrequencyData();
      band.getFrequencyBuckets();
    }
  }

  read(source: Source): number {
    const band = this.bands[source.band];
    if (!band) return 0;
    if (source.measure === "onset") {
      warnOnsetOnce();
      return 0;
    }
    if (source.measure === "bucket") {
      const v = band.bucketData[source.bucket ?? 0];
      // empty analyser buckets can be 0/0 = NaN; out-of-range is undefined
      return Number.isFinite(v) ? v / 255 : 0;
    }
    const fft = band.fftData;
    const vol = averageVolume(fft instanceof Uint8Array ? fft : fft.left);
    return Number.isFinite(vol) ? vol : 0;
  }
}
