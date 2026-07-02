import type { BakedFrame, BakeResult } from "./bake/bakeSignal";
import type { SignalSource } from "./signal";
import type { Source } from "../../bindings";

/** One playing stem's contribution to a band this frame. */
export interface ActiveStem {
  bake: BakeResult;
  /** Playback position within the stem's loop, seconds. Negative = not started yet. */
  positionSec: number;
  /** Group gain 0..1; 0 excludes the stem. */
  weight: number;
}

/** Supplies the currently-audible stems per band; called once per update(). */
export type StemProvider = () => Record<string, ActiveStem[]>;

const clamp01 = (v: number): number => (Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0);

/**
 * Sample a bake at `positionSec` with linear interpolation between adjacent
 * frame centers (frames are sampled at (i + 0.5) / fps — see frameTimes in
 * bakeUtils). Positions wrap at the loop boundary in both directions, so the
 * last frame interpolates toward the first (loops are seamless by design).
 */
export function sampleFrames(bake: BakeResult, positionSec: number): BakedFrame {
  const n = bake.frames.length;
  if (n === 0) return { volume: 0, buckets: [], onset: 0 };
  if (n === 1) return bake.frames[0];
  const f = positionSec * bake.fps - 0.5;
  const i0 = Math.floor(f);
  const frac = f - i0;
  const wrap = (i: number) => ((i % n) + n) % n;
  const a = bake.frames[wrap(i0)];
  const b = bake.frames[wrap(i0 + 1)];
  const lerp = (x: number, y: number) => x + (y - x) * frac;
  const len = Math.max(a.buckets.length, b.buckets.length);
  const buckets = Array.from({ length: len }, (_, i) => lerp(a.buckets[i] ?? 0, b.buckets[i] ?? 0));
  return { volume: lerp(a.volume, b.volume), buckets, onset: lerp(a.onset, b.onset) };
}

/**
 * Combine stems into one band frame: per-component weighted sum, clamped to
 * 0..1 (issue #91's runtime combine). Isolated so the combine rule can swap
 * (max, soft saturation) without touching the source.
 */
export function combineStems(stems: { frame: BakedFrame; weight: number }[]): BakedFrame {
  const len = stems.reduce((m, s) => Math.max(m, s.frame.buckets.length), 0);
  const out: BakedFrame = { volume: 0, buckets: new Array<number>(len).fill(0), onset: 0 };
  for (const { frame, weight } of stems) {
    out.volume += frame.volume * weight;
    out.onset += frame.onset * weight;
    for (let i = 0; i < frame.buckets.length; i++) out.buckets[i] += frame.buckets[i] * weight;
  }
  out.volume = clamp01(out.volume);
  out.onset = clamp01(out.onset);
  for (let i = 0; i < len; i++) out.buckets[i] = clamp01(out.buckets[i]);
  return out;
}

/**
 * SignalSource over pre-baked per-stem analysis: each update() pulls the
 * active stems from the provider and caches one combined frame per band;
 * read() is a cheap lookup, mirroring AnalyserSignalSource's shape.
 */
export class BakedSignalSource implements SignalSource {
  private cache: Record<string, BakedFrame> = {};

  constructor(private readonly provider: StemProvider) {}

  update(): void {
    const bands = this.provider();
    this.cache = {};
    for (const [band, stems] of Object.entries(bands)) {
      const audible = stems.filter((s) => s.weight > 0 && s.positionSec >= 0);
      this.cache[band] = combineStems(
        audible.map((s) => ({ frame: sampleFrames(s.bake, s.positionSec), weight: s.weight }))
      );
    }
  }

  read(source: Source): number {
    const frame = this.cache[source.band];
    if (!frame) return 0;
    if (source.measure === "bucket") {
      const v = frame.buckets[source.bucket ?? 0];
      return Number.isFinite(v) ? v : 0;
    }
    if (source.measure === "onset") return frame.onset;
    return frame.volume;
  }
}
