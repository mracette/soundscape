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

/**
 * Reference model of a WebAudio AudioParam under the automation the glide
 * issues: `set(rate, at, glide)` mirrors AudioPlayerWrapper.setPlaybackRate —
 * `setValueAtTime(param.value, at)` + `linearRampToValueAtTime(rate, at+glide)`
 * for a glide, `setValueAtTime(rate, at)` for an immediate set. The value is
 * piecewise linear between anchor points and holds after the last one, so the
 * exact beat integral the audio actually renders can be computed and compared
 * against the TempoClock's.
 */
class RampTrace {
  private points: Array<{ t: number; v: number }> = [{ t: 0, v: 1 }];

  valueAt(t: number): number {
    const pts = this.points;
    if (t >= pts[pts.length - 1].t) return pts[pts.length - 1].v;
    for (let i = pts.length - 1; i > 0; i--) {
      const a = pts[i - 1];
      const b = pts[i];
      if (t >= a.t) {
        return b.t === a.t ? b.v : a.v + ((b.v - a.v) * (t - a.t)) / (b.t - a.t);
      }
    }
    return pts[0].v;
  }

  set(rate: number, at: number, glide: number): void {
    const vAt = this.valueAt(at);
    this.points = this.points.filter((p) => p.t < at);
    // materialize the hold up to `at` so later interpolation can't cut corners
    this.points.push({ t: at, v: vAt });
    this.points.push(
      glide > 0 ? { t: at + glide, v: rate } : { t: at, v: rate }
    );
  }

  /** Integral of the rate from t=0 to `to` (trapezoid; exact, model is linear). */
  integral(to: number): number {
    let sum = 0;
    const pts = this.points;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      if (to <= a.t) break;
      const t1 = Math.min(b.t, to);
      if (t1 > a.t) {
        const vEnd =
          t1 === b.t ? b.v : a.v + ((b.v - a.v) * (t1 - a.t)) / (b.t - a.t);
        sum += ((a.v + vEnd) / 2) * (t1 - a.t);
      }
    }
    const last = pts[pts.length - 1];
    if (to > last.t) sum += last.v * (to - last.t);
    return sum;
  }
}

describe("Time Warp glide clock/audio identity", () => {
  beforeEach(() => {
    vi.stubGlobal("AudioContext", FakeAudioContext);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // EffectsPanel's glide shape (Sleep preset: slider 85 -> rate ~0.5758)
  const GLIDE_STEPS = 20;
  const GLIDE_STEP_S = 0.03;
  const TARGET_RATE = 1 - ((85 - 1) / 99) * 0.5;

  /**
   * Runs the EffectsPanel glide against WAW with the given inter-tick gaps
   * (gaps[i] = wait before commanded step i+1; the last gap precedes the
   * settle call) and returns the clock plus the audio reference trace.
   */
  function runGlide(gaps: number[]) {
    const { waw, ctx, clock, voice } = makeWaw();
    const trace = new RampTrace();
    const bps = BPM / 60;

    let t = 0;
    for (let i = 1; i <= GLIDE_STEPS + 1; i++) {
      t += gaps[Math.min(i - 1, gaps.length - 1)];
      ctx.currentTime = t;
      if (i <= GLIDE_STEPS) {
        const r = 1 + (TARGET_RATE - 1) * (i / GLIDE_STEPS);
        waw.setTimeWarpRate(SONG, r, GLIDE_STEP_S);
      } else {
        waw.setTimeWarpRate(SONG, TARGET_RATE); // settle
      }
      const { rate, atTime, glideSeconds } = voice.rateSets[i - 1];
      trace.set(rate, atTime, glideSeconds);

      // the identity must hold at every tick, not just at the end
      expect(clock.beatsAt(t)).toBeCloseTo(bps * trace.integral(t), 9);
    }
    return { clock, trace, bps, end: t };
  }

  it("holds the beat-integral identity for on-schedule 30ms ticks", () => {
    const { clock, trace, bps, end } = runGlide([GLIDE_STEP_S]);
    expect(clock.currentRate).toBe(TARGET_RATE);
    expect(clock.beatsAt(end + 60)).toBeCloseTo(
      bps * trace.integral(end + 60),
      9
    );
  });

  it("holds the identity under an irregular tick train (30ms, 1s stalls, 30ms)", () => {
    // background-tab throttling: some ticks stretch to ~1s mid-glide
    const gaps = Array.from({ length: GLIDE_STEPS + 1 }, (_, i) =>
      i === 4 || i === 12 || i === GLIDE_STEPS ? 1.0 : GLIDE_STEP_S
    );
    const { clock, trace, bps, end } = runGlide(gaps);
    expect(clock.currentRate).toBe(TARGET_RATE);
    // permanently in phase afterwards: both clock and audio hold the target
    expect(clock.beatsAt(end + 600)).toBeCloseTo(
      bps * trace.integral(end + 600),
      9
    );
  });

  it("holds the identity when every tick is throttled to ~1s", () => {
    const { clock, trace, bps, end } = runGlide([1.0]);
    expect(clock.beatsAt(end + 600)).toBeCloseTo(
      bps * trace.integral(end + 600),
      9
    );
  });

  it("an immediate set pins clock and voices exactly, even from a stranded mid-glide state", () => {
    // song revisit: EffectsPanel's cleanup can kill a glide before its settle
    // call, leaving the clock on a segment midpoint while voices hold the
    // segment target; MusicPlayer's mount reset must pin everything back to 1
    const { waw, ctx, clock, voice } = makeWaw();
    ctx.currentTime = 5;
    waw.setTimeWarpRate(SONG, 0.8, GLIDE_STEP_S);
    ctx.currentTime = 5.03;
    waw.setTimeWarpRate(SONG, 0.6, GLIDE_STEP_S); // glide dies here, no settle

    ctx.currentTime = 90; // much later: the revisit's mount reset
    waw.setTimeWarpRate(SONG, 1);
    expect(clock.currentRate).toBe(1);
    expect(voice.playbackRate).toBe(1);
    expect(voice.rateSets[voice.rateSets.length - 1]).toEqual({
      rate: 1,
      atTime: 90,
      glideSeconds: 0,
    });
    // boundaries resolve on the pinned rate-1 grid from here on
    expect(clock.timeAt(clock.nextBoundaryBeat(4, 90)) - 90).toBeLessThanOrEqual(2);
  });

  it("holds the identity for early ticks that interrupt an in-flight ramp", () => {
    const { clock, trace, bps, end } = runGlide([0.01]);
    expect(clock.beatsAt(end + 60)).toBeCloseTo(
      bps * trace.integral(end + 60),
      9
    );
  });
});

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
