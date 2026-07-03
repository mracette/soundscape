import { describe, it, expect } from "vitest";
import { frameGate, FRAME_INTERVAL_MS, FRAME_TOLERANCE_MS } from "./frameGate";

/**
 * Feed the gate a train of RAF ticks arriving at `hz` and count the renders,
 * exactly as SceneManager.animate consumes it: carry the returned accumulator
 * into the next tick.
 */
const runTrain = (hz: number, seconds: number) => {
  const periodMs = 1000 / hz;
  const ticks = Math.floor(seconds * hz);
  let lastFrameTime = 0;
  let renders = 0;
  for (let i = 1; i <= ticks; i++) {
    const gate = frameGate(i * periodMs, lastFrameTime);
    lastFrameTime = gate.lastFrameTime;
    if (gate.render) renders++;
  }
  return { renders, fps: renders / seconds, ticks };
};

describe("frameGate", () => {
  it("skips a tick that arrives before the interval minus the jitter margin", () => {
    const early = FRAME_INTERVAL_MS - FRAME_TOLERANCE_MS - 0.01;
    expect(frameGate(early, 0)).toEqual({ render: false, lastFrameTime: 0 });
  });

  it("renders a tick that arrives within the jitter margin of the interval", () => {
    const withinMargin = FRAME_INTERVAL_MS - FRAME_TOLERANCE_MS;
    const gate = frameGate(withinMargin, 0);
    expect(gate.render).toBe(true);
    // the accumulator advances by the exact interval, not to `now`
    expect(gate.lastFrameTime).toBe(FRAME_INTERVAL_MS);
  });

  it("renders every tick on a true 60Hz display", () => {
    const { renders, ticks } = runTrain(60, 60);
    expect(renders).toBe(ticks);
  });

  it("renders every other tick on a 120Hz display", () => {
    const { renders, ticks } = runTrain(120, 60);
    expect(renders).toBe(ticks / 2);
  });

  it.each([60, 90, 120, 144, 165])(
    "averages ~60fps on a %sHz display (remainder carry-over, no quantization)",
    (hz) => {
      const { fps } = runTrain(hz, 60);
      expect(fps).toBeGreaterThan(59);
      expect(fps).toBeLessThan(61);
    }
  );

  it("resyncs the accumulator after a long stall instead of rendering every tick to catch up", () => {
    // steady state, then a 5s stall (hidden tab / GC pause)
    let lastFrameTime = 0;
    for (let i = 1; i <= 60; i++) {
      lastFrameTime = frameGate(i * FRAME_INTERVAL_MS, lastFrameTime).lastFrameTime;
    }
    const stallEnd = 60 * FRAME_INTERVAL_MS + 5000;
    const gate = frameGate(stallEnd, lastFrameTime);
    expect(gate.render).toBe(true);
    expect(gate.lastFrameTime).toBe(stallEnd);

    // the very next 60Hz tick behaves normally again: one render per interval
    const next = frameGate(stallEnd + FRAME_INTERVAL_MS, gate.lastFrameTime);
    expect(next.render).toBe(true);
    expect(next.lastFrameTime).toBe(stallEnd + FRAME_INTERVAL_MS);
  });
});
