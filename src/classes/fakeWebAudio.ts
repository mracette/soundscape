/**
 * Minimal fake of the WebAudio surface the audio core touches, for unit tests.
 *
 * The Scheduler fires callbacks via `BufferSourceNode.onended` on silent
 * 1-sample buffers; here `advanceTo` plays the audio clock forward, firing
 * `onended` (in end-time order, with `currentTime` set to each source's end
 * time) for every started, un-stopped source whose playback has finished.
 * Firing can schedule new sources (the repeating chain), so the scan repeats
 * until nothing is due.
 */
export class FakeBufferSource {
  buffer: { duration: number } | null = null;
  onended: (() => void) | null = null;
  startTime: number | null = null;
  stopped = false;
  fired = false;

  constructor(private ctx: FakeAudioContext) {}

  connect(): void {}
  disconnect(): void {}

  start(when = 0): void {
    // per spec: a negative start time throws, a past (but non-negative) start
    // time is clamped to "now"
    if (when < 0) throw new RangeError("start time must be non-negative");
    this.startTime = Math.max(when, this.ctx.currentTime);
  }

  stop(): void {
    if (this.startTime === null) throw new Error("InvalidStateError");
    this.stopped = true;
  }

  get endTime(): number {
    return this.startTime! + (this.buffer?.duration ?? 0);
  }
}

export class FakeAudioContext {
  currentTime = 0;
  destination = {};
  sources: FakeBufferSource[] = [];

  createBuffer(
    _channels: number,
    length: number,
    sampleRate: number
  ): { duration: number } {
    return { duration: length / sampleRate };
  }

  createBufferSource(): FakeBufferSource {
    const source = new FakeBufferSource(this);
    this.sources.push(source);
    return source;
  }

  advanceTo(time: number): void {
    for (;;) {
      const due = this.sources
        .filter(
          (s) => !s.fired && !s.stopped && s.startTime !== null && s.endTime <= time
        )
        .sort((a, b) => a.endTime - b.endTime)[0];
      if (!due) break;
      due.fired = true;
      this.currentTime = due.endTime;
      due.onended?.();
    }
    this.currentTime = time;
  }
}

/** 1-sample dummy buffer at 44.1kHz — the lead time the Scheduler subtracts. */
export const DUMMY_DURATION = 1 / 44100;
