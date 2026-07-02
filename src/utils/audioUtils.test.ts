import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { nextSubdivision, loadArrayBuffer, averageVolume } from "./audioUtils";

/** nextSubdivision only reads `currentTime` off the context. */
const ctxAt = (currentTime: number) =>
  ({ currentTime } as unknown as AudioContext);

describe("nextSubdivision", () => {
  it("returns the first boundary after time zero", () => {
    // 60bpm, 1-beat subdivision -> boundaries every 1s
    expect(nextSubdivision(ctxAt(0), 60, 1)).toBe(1);
  });

  it("returns the boundary strictly after the current time when already exactly on one", () => {
    expect(nextSubdivision(ctxAt(2), 60, 1)).toBe(3);
  });

  it.each([
    // [currentTime, bpm, beats, expected]: expected = (floor(elapsed/subdiv)+1) * subdiv
    [3.1, 120, 4, 4], // 2s subdivisions
    [1.5, 90, 2, 8 / 3], // 4/3s subdivisions
    [10.2, 60, 3, 12],
    [0.4, 140, 1, 60 / 140],
  ])(
    "at t=%s with bpm=%s beats=%s returns %s",
    (currentTime, bpm, beats, expected) => {
      expect(nextSubdivision(ctxAt(currentTime), bpm, beats)).toBeCloseTo(
        expected,
        10
      );
    }
  );

  it("always lands on an exact multiple of the subdivision length", () => {
    const bpm = 87;
    const beats = 4;
    const subdivision = beats * (60 / bpm);
    const result = nextSubdivision(ctxAt(17.3), bpm, beats);
    expect(result / subdivision).toBeCloseTo(Math.round(result / subdivision), 10);
    expect(result).toBeGreaterThan(17.3);
  });
});

describe("averageVolume", () => {
  it("averages the fft bins and normalizes by 255", () => {
    expect(averageVolume(new Uint8Array([255, 255]))).toBe(1);
    expect(averageVolume(new Uint8Array([0, 255]))).toBe(0.5);
    expect(averageVolume(new Uint8Array([0, 0, 0]))).toBe(0);
  });
});

describe("loadArrayBuffer", () => {
  /** Just enough XHR to drive the load/error listeners by hand. */
  class FakeXHR {
    static latest: FakeXHR;
    responseType = "";
    status = 0;
    response: unknown = null;
    listeners: Record<string, Array<(arg?: unknown) => void>> = {};
    opened?: { method: string; url: string };

    constructor() {
      FakeXHR.latest = this;
    }

    addEventListener(type: string, fn: (arg?: unknown) => void): void {
      (this.listeners[type] ??= []).push(fn);
    }

    open(method: string, url: string): void {
      this.opened = { method, url };
    }

    send(): void {}

    emit(type: string, arg?: unknown): void {
      this.listeners[type]?.forEach((fn) => fn(arg));
    }
  }

  beforeEach(() => {
    vi.stubGlobal("XMLHttpRequest", FakeXHR);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves with the response body on HTTP 200", async () => {
    const promise = loadArrayBuffer("audio/test.mp3");
    const xhr = FakeXHR.latest;
    expect(xhr.opened).toEqual({ method: "GET", url: "audio/test.mp3" });

    const body = new ArrayBuffer(8);
    xhr.status = 200;
    xhr.response = body;
    xhr.emit("load");

    await expect(promise).resolves.toBe(body);
  });

  it("rejects on a non-200 'load' (404) instead of hanging forever", async () => {
    const promise = loadArrayBuffer("audio/missing.mp3");
    const xhr = FakeXHR.latest;
    xhr.status = 404;
    xhr.emit("load");

    await expect(promise).rejects.toThrow(
      "Failed to load audio (HTTP 404): audio/missing.mp3"
    );
  });

  it("rejects when the network errors out", async () => {
    const promise = loadArrayBuffer("audio/test.mp3");
    const failure = new Error("network down");
    FakeXHR.latest.emit("error", failure);

    await expect(promise).rejects.toBe(failure);
  });
});
