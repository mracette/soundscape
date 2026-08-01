import { describe, test, expect } from "vitest";
import { createStemProvider, type StemProviderDeps } from "../stemProvider";

const BAKE = (band: string) => ({ fps: 30, sampleRate: 44100, durationSec: 2, band, frames: [] });

function deps(over: Partial<StemProviderDeps> = {}): StemProviderDeps {
  return {
    now: () => 10,
    outputLatency: () => 0.02,
    groups: [{ name: "bass", voices: ["kick", "sub"] }],
    bakes: { kick: BAKE("bass"), sub: BAKE("bass") },
    players: {
      kick: { startedAt: 5, startOffset: 0, playbackRate: 1, loopDuration: 2 },
      sub: { startedAt: null, startOffset: 0, playbackRate: 1, loopDuration: 2 },
    },
    groupGain: () => 1,
    activeVoices: () => [{ id: "kick", group: "bass", voiceState: "active" }],
    ...over,
  };
}

describe("createStemProvider", () => {
  test("active voice yields its stem with wrapped latency-compensated position", () => {
    const stems = createStemProvider(deps())();
    expect(stems.bass).toHaveLength(1);
    // (10 - 5 - 0.02) mod 2 = 0.98
    expect(stems.bass[0].positionSec).toBeCloseTo(0.98, 10);
    expect(stems.bass[0].weight).toBe(1);
  });
  test("pending-stop voices stay included; stopped/pending-start-not-yet-started excluded", () => {
    const d = deps({
      activeVoices: () => [
        { id: "kick", group: "bass", voiceState: "pending-stop" },
        { id: "sub", group: "bass", voiceState: "stopped" },
      ],
    });
    const stems = createStemProvider(d)();
    expect(stems.bass.map((s) => s.bake.band)).toEqual(["bass"]);
  });
  test("a scheduled-but-future start yields negative position (source excludes it)", () => {
    const d = deps({
      players: {
        kick: { startedAt: 11, startOffset: 0, playbackRate: 1, loopDuration: 2 },
        sub: { startedAt: null, startOffset: 0, playbackRate: 1, loopDuration: 2 },
      },
    });
    expect(createStemProvider(d)().bass[0].positionSec).toBeLessThan(0);
  });
  test("start offset and playback rate shift and scale the position", () => {
    const d = deps({
      players: {
        kick: { startedAt: 5, startOffset: 0.5, playbackRate: 1.25, loopDuration: 2 },
        sub: { startedAt: null, startOffset: 0, playbackRate: 1, loopDuration: 2 },
      },
    });
    // (0.5 + (10 - 5) * 1.25 - 0.02) mod 2 = 6.73 mod 2 = 0.73
    expect(createStemProvider(d)().bass[0].positionSec).toBeCloseTo(0.73, 10);
  });
  test("missing bake or unstarted player is skipped without throwing", () => {
    const d = deps({ bakes: {}, activeVoices: () => [{ id: "kick", group: "bass", voiceState: "active" }] });
    expect(createStemProvider(d)().bass).toEqual([]);
  });
  test("group gain becomes the weight", () => {
    const stems = createStemProvider(deps({ groupGain: () => 0.5 }))();
    expect(stems.bass[0].weight).toBe(0.5);
  });
});
