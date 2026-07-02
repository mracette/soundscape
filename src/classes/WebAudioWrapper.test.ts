import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WebAudioWrapper } from "./WebAudioWrapper";
import { TempoClock } from "./TempoClock";
import { AudioPlayerWrapper } from "./AudioPlayerWrapper";
import { FakeAudioContext } from "./fakeWebAudio";
import { AppConfigEntry, SongId } from "../contexts/contexts";

const SONG: SongId = "moonrise";

// bpm 120 = 2 beats/sec at rate 1; a 4-beat boundary every 2s
const BPM = 120;

/** Records the transport-facing AudioPlayerWrapper surface. */
class FakeVoicePlayer {
  playbackRate = 1;
  starts: Array<{ time: number; offset: number | undefined }> = [];
  stops: number[] = [];
  rateSets: Array<{ rate: number; atTime: number; glideSeconds: number }> = [];

  start(time: number, offset?: number): void {
    this.starts.push({ time, offset });
  }

  stop(time?: number): void {
    this.stops.push(time ?? -1);
  }

  setPlaybackRate(rate: number, atTime: number, glideSeconds = 0): void {
    this.playbackRate = rate;
    this.rateSets.push({ rate, atTime, glideSeconds });
  }
}

const asPlayer = (p: FakeVoicePlayer) => p as unknown as AudioPlayerWrapper;

function makeWaw() {
  const waw = new WebAudioWrapper([
    { id: SONG, audio: { bpm: BPM } },
  ] as unknown as AppConfigEntry[]);
  const ctx = waw.audioCtx as unknown as FakeAudioContext;
  const clock = new TempoClock(BPM);
  waw.tempoClocks[SONG] = clock;
  const voice = new FakeVoicePlayer();
  waw.nodes.voices = { [SONG]: { lead: asPlayer(voice) } };
  return { waw, ctx, clock, voice };
}

describe("WebAudioWrapper transport", () => {
  beforeEach(() => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("commits a start sample-accurately at the boundary when there is enough lead", () => {
    const { waw, ctx, clock, voice } = makeWaw();
    const onCommit = vi.fn();

    ctx.advanceTo(1); // beat 2; next 4-beat boundary at t=2
    waw.scheduleAtBoundary("lead", asPlayer(voice), clock, 4, "start", onCommit);

    ctx.advanceTo(2.5);
    expect(voice.starts).toEqual([{ time: 2, offset: undefined }]);
    expect(onCommit).toHaveBeenCalledWith(2);
  });

  it("joins mid-loop in phase when the boundary lands closer than the first tick", () => {
    const { waw, ctx, clock, voice } = makeWaw();
    voice.playbackRate = 0.5; // warped: wall-clock overshoot maps to buffer seconds at the rate
    const onCommit = vi.fn();

    // beat 3.996: the beat-4 boundary (t=2.0) is only 2ms away, but the first
    // transport tick fires 15ms later — the boundary is past by then
    ctx.advanceTo(1.998);
    waw.scheduleAtBoundary("lead", asPlayer(voice), clock, 4, "start", onCommit);

    ctx.advanceTo(2.1);
    expect(voice.starts).toHaveLength(1);
    const { time, offset } = voice.starts[0];
    // tick fired at 1.998 + 0.015; start a hair (TRANSPORT_MIN_LEAD) ahead...
    expect(time).toBeCloseTo(2.023, 9);
    // ...at the intra-loop position the voice would have reached had it
    // started exactly at t=2.0: (startAt - boundary) * playbackRate
    expect(offset).toBeCloseTo((time - 2.0) * 0.5, 9);
    // the musical commit is still reported at the boundary
    expect(onCommit).toHaveBeenCalledWith(2.0);
  });

  it("re-arms and commits after a raw scheduler.clear() (self-healing latch)", () => {
    const { waw, ctx, clock, voice } = makeWaw();

    ctx.advanceTo(1);
    waw.scheduleAtBoundary("lead", asPlayer(voice), clock, 4, "start", vi.fn());

    // the pre-fix MusicPlayer cleanup: kills the armed tick without firing it,
    // leaving transportTick pointing at a dead event
    waw.scheduler.clear();
    waw.cancelBoundary("lead");

    // a later visit schedules again — the transport must notice the stale tick
    ctx.advanceTo(3); // beat 6; next 4-beat boundary at t=4
    const onCommit = vi.fn();
    waw.scheduleAtBoundary("lead", asPlayer(voice), clock, 4, "start", onCommit);

    ctx.advanceTo(4.5);
    expect(voice.starts).toEqual([{ time: 4, offset: undefined }]);
    expect(onCommit).toHaveBeenCalledWith(4);
  });

  it("clearTransport drops pending requests, disarms the tick, and leaves the transport re-armable", () => {
    const { waw, ctx, clock, voice } = makeWaw();

    ctx.advanceTo(1);
    waw.scheduleAtBoundary("lead", asPlayer(voice), clock, 4, "start", vi.fn());

    waw.clearTransport();
    expect(waw.scheduler.queue).toHaveLength(0); // armed tick cancelled

    // the dropped request never commits
    ctx.advanceTo(3);
    expect(voice.starts).toHaveLength(0);

    // and the transport still works afterwards
    const onCommit = vi.fn();
    waw.scheduleAtBoundary("lead", asPlayer(voice), clock, 4, "start", onCommit);
    ctx.advanceTo(4.5);
    expect(voice.starts).toEqual([{ time: 4, offset: undefined }]);
    expect(onCommit).toHaveBeenCalledWith(4);
  });
});
