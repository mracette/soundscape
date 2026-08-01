import type { ActiveStem, StemProvider } from "./bakedSignal";
import type { BakeResult } from "./bake/bakeSignal";

export interface StemProviderDeps {
  /** audioCtx.currentTime */
  now: () => number;
  /** Output buffer lead compensation, seconds (ctx.outputLatency, else 0). */
  outputLatency: () => number;
  groups: { name: string; voices: string[] }[];
  bakes: Record<string, BakeResult>;
  players: Record<
    string,
    {
      startedAt: number | null;
      startOffset: number;
      playbackRate: number;
      loopDuration: number | null;
    }
  >;
  groupGain: (group: string) => number;
  activeVoices: () => { id: string; group: string; voiceState: string }[];
}

const AUDIBLE = new Set(["active", "pending-stop"]);

/**
 * Bridge from app state to the runtime's StemProvider: audible voices (store),
 * per-voice loop position (player clocks), group gain as weight. Pure — every
 * dependency is injected, so the whole adapter is unit-testable without WebAudio.
 */
export function createStemProvider(deps: StemProviderDeps): StemProvider {
  return () => {
    const audible = new Set(
      deps.activeVoices().filter((v) => AUDIBLE.has(v.voiceState)).map((v) => v.id)
    );
    const t = deps.now();
    const latency = deps.outputLatency();
    const out: Record<string, ActiveStem[]> = {};
    for (const group of deps.groups) {
      const stems: ActiveStem[] = [];
      for (const voice of group.voices) {
        if (!audible.has(voice)) continue;
        const bake = deps.bakes[voice];
        const player = deps.players[voice];
        if (!bake || !player || player.startedAt === null || !player.loopDuration) continue;
        // Buffer time advances at playbackRate, and the voice may have joined
        // its loop mid-cycle (startOffset). Rate glides are short; treating the
        // rate as constant since start is within a frame of exact.
        const elapsed = (t - player.startedAt) * player.playbackRate - latency;
        // negative elapsed = start is scheduled but hasn't hit yet; keep it
        // negative so BakedSignalSource excludes the stem until it's audible
        const positionSec =
          elapsed < 0 ? elapsed : (player.startOffset + elapsed) % player.loopDuration;
        stems.push({ bake, positionSec, weight: deps.groupGain(group.name) });
      }
      out[group.name] = stems;
    }
    return out;
  };
}
