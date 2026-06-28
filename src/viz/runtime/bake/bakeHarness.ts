import { synthNoise } from "./bakeUtils";
import { bakeSignal, type BakeResult } from "./bakeSignal";

declare global {
  interface Window {
    __blenderBake?: { ready: boolean; result: BakeResult };
  }
}

async function main(): Promise<void> {
  const sampleRate = 44100;
  const samples = synthNoise({ sampleRate, durationSec: 1, toneSec: 0.5, seed: 1 });
  const result = await bakeSignal({
    samples,
    sampleRate,
    fps: 30,
    numBuckets: 8,
    analyserConfig: {
      power: 11,
      smoothingTimeConstant: 0,
      minFrequency: 20,
      maxFrequency: 16500,
    },
    band: "test",
  });
  window.__blenderBake = { ready: true, result };
}

main().catch((err) => console.error(err));
