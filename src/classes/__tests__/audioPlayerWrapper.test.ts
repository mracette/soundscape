import { describe, test, expect } from "vitest";
import { AudioPlayerWrapper } from "../AudioPlayerWrapper";

function fakeContext() {
  const makeSource = () => ({
    buffer: { duration: 2.5 },
    loop: true, loopStart: 0, loopEnd: 0,
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
