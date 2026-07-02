/**
 * Single source of truth for musical time under a variable playback rate.
 *
 * The original grid (`nextSubdivision` in audioUtils) maps wall-clock seconds to
 * beats with a constant BPM. Time Warp changes the rate, so the grid must integrate a
 * rate that can change. This clock does that by re-anchoring on every rate change:
 * between changes the rate is constant, so beats <-> time is a simple linear map,
 * and the accumulated beat count carries across changes for continuity.
 *
 * At rate 1 anchored at time 0 it is identical to `nextSubdivision`. Times are
 * AudioContext seconds passed in by the caller, which keeps this class pure (no
 * AudioContext reference) and trivially unit-testable.
 */
export class TempoClock {
  private readonly beatsPerSecondAtRate1: number;
  private anchorTime = 0;
  private anchorBeats = 0;
  private rate = 1;

  constructor(baseBpm: number) {
    this.beatsPerSecondAtRate1 = baseBpm / 60;
  }

  /** Beats elapsed at AudioContext time `time`, under the current rate. */
  beatsAt(time: number): number {
    return (
      this.anchorBeats +
      (time - this.anchorTime) * this.beatsPerSecondAtRate1 * this.rate
    );
  }

  /** AudioContext time at which `beats` total beats will have elapsed. */
  timeAt(beats: number): number {
    return (
      this.anchorTime +
      (beats - this.anchorBeats) / (this.beatsPerSecondAtRate1 * this.rate)
    );
  }

  /**
   * Re-anchor to a new rate at AudioContext time `now`, preserving beat
   * continuity. Call this at the same instant the voices' playbackRate is set to
   * `rate`, so the clock and the audio agree.
   */
  setRate(rate: number, now: number): void {
    this.anchorBeats = this.beatsAt(now);
    this.anchorTime = now;
    this.rate = rate;
  }

  /**
   * Re-anchor at `now`, crediting the interval since the previous anchor at
   * `avgRate` instead of the held rate, then continue at `rate`.
   *
   * A held rate set by `setRate` is only a *prediction* of the interval's
   * average when the audio is mid-ramp — exact if the next re-anchor lands on
   * schedule, wrong if the tick timer stretches (background-tab throttling,
   * main-thread jank). Once the interval's true length is known, the caller
   * computes the audio's actual time-weighted average rate over it and trues
   * the clock up here, keeping the clock's beat integral equal to the audio's
   * for any gap length. `setRate(r, now)` is equivalent to
   * `resyncRate(currentRate, r, now)`.
   */
  resyncRate(avgRate: number, rate: number, now: number): void {
    this.anchorBeats +=
      (now - this.anchorTime) * this.beatsPerSecondAtRate1 * avgRate;
    this.anchorTime = now;
    this.rate = rate;
  }

  /**
   * Beat count of the next boundary that is a whole multiple of `intervalBeats`,
   * strictly after `fromTime`. The beat count is rate-invariant: as the rate
   * changes, this target stays fixed while its wall-clock time (`timeAt`) moves,
   * which is what lets a pending voice re-resolve its start against the live grid.
   */
  nextBoundaryBeat(intervalBeats: number, fromTime: number): number {
    const beatsNow = this.beatsAt(fromTime);
    return (Math.floor(beatsNow / intervalBeats) + 1) * intervalBeats;
  }

  /**
   * AudioContext time of the next boundary that is a whole multiple of
   * `intervalBeats`, strictly after `fromTime`. Time-Warp-aware replacement for
   * `nextSubdivision`.
   */
  nextBoundary(intervalBeats: number, fromTime: number): number {
    return this.timeAt(this.nextBoundaryBeat(intervalBeats, fromTime));
  }

  get currentRate(): number {
    return this.rate;
  }

  get effectiveBpm(): number {
    return this.beatsPerSecondAtRate1 * 60 * this.rate;
  }
}
