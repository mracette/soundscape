import { describe, it, expect } from "vitest";
import { TempoClock } from "./TempoClock";

// bpm 120 = 2 beats/sec at rate 1 — keeps the arithmetic legible
const BPM = 120;

describe("TempoClock", () => {
  describe("beatsAt / timeAt", () => {
    it("at rate 1 anchored at 0, maps time to beats with the base bpm", () => {
      const clock = new TempoClock(BPM);
      expect(clock.beatsAt(0)).toBe(0);
      expect(clock.beatsAt(3)).toBe(6);
      expect(clock.timeAt(6)).toBe(3);
    });

    it.each([1.0, 0.7, 0.5])(
      "round-trips time -> beats -> time at rate %s",
      (rate) => {
        const clock = new TempoClock(BPM);
        clock.setRate(rate, 0);
        for (const t of [0.1, 1, 12.34, 100.5]) {
          expect(clock.timeAt(clock.beatsAt(t))).toBeCloseTo(t, 10);
          expect(clock.beatsAt(clock.timeAt(t))).toBeCloseTo(t, 10);
        }
      }
    );

    it("scales beat accumulation by the rate", () => {
      const clock = new TempoClock(BPM);
      clock.setRate(0.5, 0);
      expect(clock.beatsAt(3)).toBe(3); // 2 beats/sec * 0.5
    });
  });

  describe("setRate", () => {
    it("preserves the beat count at the instant of the change", () => {
      const clock = new TempoClock(BPM);
      expect(clock.beatsAt(10)).toBe(20);
      clock.setRate(0.5, 10);
      expect(clock.beatsAt(10)).toBe(20);
    });

    it("accumulates beats at the new rate after the change", () => {
      const clock = new TempoClock(BPM);
      clock.setRate(0.5, 10);
      expect(clock.beatsAt(11)).toBe(21); // 2 beats/sec * 0.5 for 1s
    });

    it("carries beat continuity across multiple rate changes", () => {
      const clock = new TempoClock(BPM);
      clock.setRate(0.7, 5); // 10 beats by t=5
      clock.setRate(0.5, 10); // + 2*0.7*5 = 7 -> 17 beats by t=10
      expect(clock.beatsAt(10)).toBeCloseTo(17, 10);
      expect(clock.beatsAt(12)).toBeCloseTo(19, 10);
      expect(clock.timeAt(19)).toBeCloseTo(12, 10);
    });
  });

  describe("resyncRate", () => {
    it("credits the elapsed interval at avgRate instead of the held rate", () => {
      const clock = new TempoClock(BPM);
      // held rate 1 for 10s would credit 20 beats; the true average was 0.5
      clock.resyncRate(0.5, 0.7, 10);
      expect(clock.beatsAt(10)).toBe(10);
      expect(clock.currentRate).toBe(0.7);
      expect(clock.beatsAt(11)).toBeCloseTo(10 + 2 * 0.7, 10);
    });

    it("is equivalent to setRate when avgRate equals the held rate", () => {
      const a = new TempoClock(BPM);
      const b = new TempoClock(BPM);
      a.setRate(0.8, 4);
      b.resyncRate(1, 0.8, 4);
      a.setRate(0.6, 9);
      b.resyncRate(0.8, 0.6, 9);
      for (const t of [9, 10, 25]) {
        expect(b.beatsAt(t)).toBeCloseTo(a.beatsAt(t), 10);
      }
    });
  });

  describe("nextBoundary / nextBoundaryBeat", () => {
    it("lands on exact grid multiples of the interval", () => {
      const clock = new TempoClock(BPM);
      // 4-beat interval at 2 beats/sec -> boundaries every 2s
      expect(clock.nextBoundaryBeat(4, 3.1)).toBe(8);
      expect(clock.nextBoundary(4, 3.1)).toBe(4);
      expect(clock.nextBoundary(4, 0.01)).toBe(2);
    });

    it("returns the boundary strictly after `fromTime` when already exactly on one", () => {
      const clock = new TempoClock(BPM);
      expect(clock.beatsAt(2)).toBe(4); // exactly on the 4-beat grid
      expect(clock.nextBoundaryBeat(4, 2)).toBe(8);
      expect(clock.nextBoundary(4, 2)).toBe(4);
    });

    it("spaces boundaries by interval / (bps * rate) under a slowed rate", () => {
      const clock = new TempoClock(BPM);
      clock.setRate(0.5, 0);
      // 4 beats at 1 effective beat/sec -> boundaries every 4s
      expect(clock.nextBoundary(4, 0.1)).toBe(4);
      expect(clock.nextBoundary(4, 4.1)).toBe(8);
    });

    it("keeps the boundary's beat identity fixed across a rate change while its wall-clock time moves", () => {
      // This is what lets a pending voice re-resolve its start against the live
      // grid: the target beat is rate-invariant, timeAt() gives the live time.
      const clock = new TempoClock(BPM);
      const targetBeat = clock.nextBoundaryBeat(4, 9); // beats 18 -> beat 20
      expect(targetBeat).toBe(20);
      expect(clock.timeAt(targetBeat)).toBe(10);

      clock.setRate(0.5, 9.5); // 19 beats elapsed; 1 beat left at 1 beat/sec
      expect(clock.nextBoundaryBeat(4, 9.5)).toBe(targetBeat);
      expect(clock.timeAt(targetBeat)).toBeCloseTo(10.5, 10);
    });
  });

  describe("currentRate / effectiveBpm", () => {
    it("reports the last commanded rate", () => {
      // AudioPlayerWrapper.start reads this at commit time so a voice comes in
      // at the live rate rather than one pinned at schedule time.
      const clock = new TempoClock(BPM);
      expect(clock.currentRate).toBe(1);
      clock.setRate(0.7, 3);
      expect(clock.currentRate).toBe(0.7);
      clock.setRate(0.5, 6);
      expect(clock.currentRate).toBe(0.5);
    });

    it("reports the effective bpm as base bpm scaled by the rate", () => {
      const clock = new TempoClock(BPM);
      expect(clock.effectiveBpm).toBe(120);
      clock.setRate(0.7, 0);
      expect(clock.effectiveBpm).toBeCloseTo(84, 10);
    });
  });
});
