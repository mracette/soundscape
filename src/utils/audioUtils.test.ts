import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { loadArrayBuffer, averageVolume } from "./audioUtils";

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

  it("resolves on status 0 with a non-empty body (custom schemes like capacitor://)", async () => {
    const promise = loadArrayBuffer("audio/test.mp3");
    const xhr = FakeXHR.latest;

    const body = new ArrayBuffer(8);
    xhr.status = 0;
    xhr.response = body;
    xhr.emit("load");

    await expect(promise).resolves.toBe(body);
  });

  it("rejects on status 0 with an empty body", async () => {
    const promise = loadArrayBuffer("audio/missing.mp3");
    const xhr = FakeXHR.latest;
    xhr.status = 0;
    xhr.response = new ArrayBuffer(0);
    xhr.emit("load");

    await expect(promise).rejects.toThrow(
      "Failed to load audio (HTTP 0): audio/missing.mp3"
    );
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
