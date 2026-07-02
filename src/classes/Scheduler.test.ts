import { describe, it, expect, beforeEach, vi } from "vitest";
import { Scheduler } from "./Scheduler";
import { FakeAudioContext, DUMMY_DURATION } from "./fakeWebAudio";

describe("Scheduler", () => {
  let ctx: FakeAudioContext;
  let scheduler: Scheduler;

  beforeEach(() => {
    ctx = new FakeAudioContext();
    scheduler = new Scheduler(ctx as unknown as AudioContext);
  });

  describe("scheduleOnce", () => {
    it("fires the callback at the scheduled time, not early", () => {
      const cb = vi.fn();
      scheduler.scheduleOnce(2, cb);

      ctx.advanceTo(1.99);
      expect(cb).not.toHaveBeenCalled();

      ctx.advanceTo(2);
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it("fires with the audio clock at the scheduled time", () => {
      let firedAt = -1;
      scheduler.scheduleOnce(2, () => (firedAt = ctx.currentTime));
      ctx.advanceTo(3);
      expect(firedAt).toBeCloseTo(2, 6);
    });

    it("starts the dummy source one buffer-length before the target time", () => {
      scheduler.scheduleOnce(2, () => {});
      expect(ctx.sources[0].startTime).toBeCloseTo(2 - DUMMY_DURATION, 12);
    });

    it("returns incrementing event ids synchronously when given a callback", () => {
      const a = scheduler.scheduleOnce(1, () => {});
      const b = scheduler.scheduleOnce(2, () => {});
      expect(a).toBe(1);
      expect(b).toBe(2);
    });

    it("removes its event from the queue after firing (callback path self-cleans)", () => {
      const id = scheduler.scheduleOnce(1, () => {}) as number;
      expect(scheduler.getEvent(id)).not.toBe(false);
      ctx.advanceTo(1.5);
      expect(scheduler.getEvent(id)).toBe(false);
      expect(scheduler.queue).toHaveLength(0);
    });

    it("without a callback, resolves a promise with the event id when the event fires", async () => {
      const promise = scheduler.scheduleOnce(2);
      expect(promise).toBeInstanceOf(Promise);
      ctx.advanceTo(2.5);
      await expect(promise).resolves.toBe(1);
    });

    it("without a callback, leaves the fired event in the queue (promise path never self-cleans)", async () => {
      // Characterization, likely a leak: the callback path calls cancel() after
      // firing but the promise path does not, so the event lingers until clear().
      const promise = scheduler.scheduleOnce(2);
      ctx.advanceTo(2.5);
      await promise;
      expect(scheduler.queue).toHaveLength(1);
      expect(scheduler.getEvent(1)).not.toBe(false);
    });
  });

  describe("scheduleRepeating", () => {
    it("fires at the start time and every `frequency` seconds after", () => {
      const times: number[] = [];
      scheduler.scheduleRepeating(1, 0.5, () => times.push(ctx.currentTime));

      ctx.advanceTo(2.9);
      expect(times).toHaveLength(4);
      expect(times[0]).toBeCloseTo(1, 6);
      expect(times[1]).toBeCloseTo(1.5, 6);
      expect(times[2]).toBeCloseTo(2, 6);
      expect(times[3]).toBeCloseTo(2.5, 6);
    });

    it("does not fire before the start time", () => {
      const cb = vi.fn();
      scheduler.scheduleRepeating(1, 0.5, cb);
      ctx.advanceTo(0.99);
      expect(cb).not.toHaveBeenCalled();
    });

    it("schedules each occurrence at `time + count * frequency` so drift cannot accumulate", () => {
      scheduler.scheduleRepeating(1, 0.25, () => {});
      ctx.advanceTo(5);

      // 17 occurrences fired (1.0 .. 5.0); the live source is occurrence 17
      const event = scheduler.getEvent(1);
      expect(event).not.toBe(false);
      expect((event as { count: number }).count).toBe(17);
      const liveSource = ctx.sources[ctx.sources.length - 1];
      expect(liveSource.startTime).toBeCloseTo(1 + 17 * 0.25 - DUMMY_DURATION, 12);
    });

    it("keeps a single queue entry across many occurrences", () => {
      scheduler.scheduleRepeating(1, 0.25, () => {});
      ctx.advanceTo(5);
      expect(scheduler.queue).toHaveLength(1);
    });

    it("clamps a start time in the past to zero rather than throwing", () => {
      scheduler.scheduleRepeating(DUMMY_DURATION / 2, 1, () => {});
      expect(ctx.sources[0].startTime).toBe(0);
    });
  });

  describe("updateCallback", () => {
    it("swaps the callback for all subsequent occurrences", () => {
      const first = vi.fn();
      const second = vi.fn();
      const id = scheduler.scheduleRepeating(1, 1, first);

      ctx.advanceTo(1.5);
      expect(first).toHaveBeenCalledTimes(1);

      scheduler.updateCallback(id, second);
      ctx.advanceTo(3.5);
      expect(first).toHaveBeenCalledTimes(1);
      expect(second).toHaveBeenCalledTimes(2);
    });
  });

  describe("cancel", () => {
    it("cancelling between schedule and fire prevents the callback and empties the queue", () => {
      const cb = vi.fn();
      const id = scheduler.scheduleOnce(2, cb) as number;

      scheduler.cancel(id);
      ctx.advanceTo(3);

      expect(cb).not.toHaveBeenCalled();
      expect(scheduler.queue).toHaveLength(0);
      expect(ctx.sources[0].stopped).toBe(true);
      expect(ctx.sources[0].onended).toBeNull();
    });

    it("cancelling a repeating event mid-stream stops all further occurrences", () => {
      const cb = vi.fn();
      const id = scheduler.scheduleRepeating(1, 0.5, cb);

      ctx.advanceTo(1.6);
      expect(cb).toHaveBeenCalledTimes(2);

      scheduler.cancel(id);
      ctx.advanceTo(4);
      expect(cb).toHaveBeenCalledTimes(2);
      expect(scheduler.queue).toHaveLength(0);
    });

    it("is a no-op for an unknown id and for undefined", () => {
      scheduler.scheduleOnce(1, () => {});
      scheduler.cancel(999);
      scheduler.cancel(undefined);
      expect(scheduler.queue).toHaveLength(1);
    });
  });

  describe("clear", () => {
    it("silences and removes every pending event", () => {
      const a = vi.fn();
      const b = vi.fn();
      scheduler.scheduleOnce(1, a);
      scheduler.scheduleRepeating(1, 0.5, b);

      scheduler.clear();
      ctx.advanceTo(5);

      expect(a).not.toHaveBeenCalled();
      expect(b).not.toHaveBeenCalled();
      expect(scheduler.queue).toHaveLength(0);
    });
  });

  describe("getEvent", () => {
    it("returns false (not undefined) when the event is not found", () => {
      expect(scheduler.getEvent(42)).toBe(false);
    });
  });
});
