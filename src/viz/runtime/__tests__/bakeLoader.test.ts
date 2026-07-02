import { describe, test, expect, vi } from "vitest";
import { loadSongBakes, warnIfStale } from "../bakeLoader";

const BAKE = { fps: 30, sampleRate: 44100, durationSec: 2, band: "bass", frames: [] };

function fetchStub(byUrl: Record<string, unknown>) {
  return vi.fn(async (url: string) => {
    const body = byUrl[url];
    return body
      ? ({ ok: true, json: async () => body } as Response)
      : ({ ok: false, status: 404, json: async () => ({}) } as Response);
  }) as unknown as typeof fetch;
}

describe("loadSongBakes", () => {
  test("fetches <base>bakes/<song>/<voice>.json per voice", async () => {
    const f = fetchStub({ "/bakes/prelude/kick.json": BAKE });
    const bakes = await loadSongBakes("/", "prelude", ["kick"], f);
    expect(bakes.kick.durationSec).toBe(2);
  });
  test("missing file warns and omits, others still load", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const f = fetchStub({ "/bakes/prelude/kick.json": BAKE });
    const bakes = await loadSongBakes("/", "prelude", ["kick", "ghost"], f);
    expect(Object.keys(bakes)).toEqual(["kick"]);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("warnIfStale", () => {
  test("warns when durations diverge beyond tolerance", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnIfStale({ ...BAKE, durationSec: 2 }, 3.5, "kick");
    expect(warn).toHaveBeenCalledOnce();
    warnIfStale({ ...BAKE, durationSec: 2 }, 2.005, "kick"); // within 50ms tolerance
    expect(warn).toHaveBeenCalledOnce();
    warnIfStale({ ...BAKE, durationSec: 2 }, null, "kick");  // pre-init: silent
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});
