import { synthNoise } from "./bakeUtils";
import { bakeSignal, type BakeResult } from "./bakeSignal";

declare global {
  interface Window {
    __blenderBake?: { ready: boolean; raw: BakeResult; smoothed: BakeResult };
  }
}

async function main(): Promise<void> {
  const sampleRate = 44100;
  const samples = synthNoise({ sampleRate, durationSec: 1, toneSec: 0.5, seed: 1 });
  const common = {
    samples,
    sampleRate,
    fps: 30,
    numBuckets: 8,
    band: "test",
  } as const;
  const raw = await bakeSignal({
    ...common,
    analyserConfig: { power: 11, smoothingTimeConstant: 0, minFrequency: 20, maxFrequency: 16500 },
  });
  const smoothed = await bakeSignal({
    ...common,
    analyserConfig: { power: 11, smoothingTimeConstant: 0.8, minFrequency: 20, maxFrequency: 16500 },
  });
  window.__blenderBake = { ready: true, raw, smoothed };
}

main().catch((err) => console.error(err));
