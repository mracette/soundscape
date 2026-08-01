import { describe, test, expect } from "vitest";
import { AudioPlayerWrapper } from "../AudioPlayerWrapper";

function fakeContext() {
  const makeSource = () => ({
    buffer: { duration: 2.5 },
    loop: true, loopStart: 0, loopEnd: 0,
    playbackRate: { value: 1, setValueAtTime() {}, linearRampToValueAtTime() {} },
    connect() {}, disconnect() {},
    start() {}, stop() {},
  });
  return { destination: {}, createBufferSource: makeSource, __makeSource: makeSource } as unknown as AudioContext;
}

describe("AudioPlayerWrapper start bookkeeping", () => {
  function player() {
    const ctx = fakeContext();
    const p = new AudioPlayerWrapper(ctx, "unused", {});
    // bypass init(): inject a fake buffer source directly
    (p as unknown as { bufferSource: unknown }).bufferSource = (ctx as unknown as { __makeSource: () => unknown }).__makeSource();
    return p;
  }
  test("records startedAt on start and keeps it across stop", () => {
    const p = player();
    expect(p.startedAt).toBeNull();
    p.start(12.5);
    expect(p.startedAt).toBe(12.5);
    p.stop(16);
    expect(p.startedAt).toBe(12.5); // pending-stop voices stay audible; store drives exclusion
  });
  test("records the wrapped start offset and keeps it across stop", () => {
    const p = player();
    expect(p.startOffset).toBe(0);
    p.start(12.5, 6);
    expect(p.startOffset).toBe(6 % 2.5);
    p.stop(16);
    expect(p.startOffset).toBe(6 % 2.5);
  });
  test("a mid-playback rate change re-bases the position clock", () => {
    const p = player();
    p.start(10);
    // 11s at rate 1 folds into the offset: 11 % 2.5 = 1.0
    p.setPlaybackRate(0.5, 21);
    expect(p.startedAt).toBe(21);
    expect(p.startOffset).toBeCloseTo(1.0, 10);
    // a second change folds the 0.5-rate segment: 1.0 + 1 * 0.5 = 1.5
    p.setPlaybackRate(2, 22);
    expect(p.startedAt).toBe(22);
    expect(p.startOffset).toBeCloseTo(1.5, 10);
  });
  test("a rate change before a scheduled start leaves the clock anchored", () => {
    const p = player();
    p.start(30);
    p.setPlaybackRate(0.5, 25);
    expect(p.startedAt).toBe(30);
    expect(p.startOffset).toBe(0);
  });
  test("startedAt survives the reload fallback path", () => {
    const p = player();
    (p as unknown as { bufferSource: { start: () => void } }).bufferSource.start = () => { throw new Error("used"); };
    p.start(3);
    expect(p.startedAt).toBe(3);
  });
  test("loopDuration reflects the buffer", () => {
    const p = player();
    expect(p.loopDuration).toBe(2.5);
  });
});
