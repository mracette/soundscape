interface SchedulerEvent {
  id: number;
  time: number;
  type: "single" | "repeating";
  source: AudioBufferSourceNode;
  count?: number;
  frequency?: number;
  callback?: () => void;
}

interface RepeatingEvent extends SchedulerEvent {
  type: "repeating";
  count: number;
  frequency: number;
  callback: () => void;
}

/**
 * Precision event scheduler built on the WebAudio clock.
 *
 * `setTimeout`/`setInterval` drift by tens of milliseconds, which is audible.
 * This class sidesteps that by firing callbacks via `BufferSourceNode.onended`:
 * a silent 1-sample dummy buffer is scheduled at a precise `AudioContext` time,
 * and the callback fires when that buffer ends. All timing is in AudioContext
 * seconds (same origin as `audioCtx.currentTime`).
 *
 * Repeating events chain themselves: each fired node immediately schedules the
 * next one `frequency` seconds later, so drift never accumulates.
 */
export class Scheduler {
  audioCtx: AudioContext;
  queue: SchedulerEvent[];
  eventId: number;

  constructor(audioCtx: AudioContext) {
    // bind audio context
    this.audioCtx = audioCtx;

    // for events
    this.queue = [];

    // event id
    this.eventId = 0;
  }

  /**
   * Schedule a one-shot event at `time` (AudioContext seconds, absolute).
   *
   * With `callback`: fires it and returns the event id synchronously.
   * Without `callback`: returns a `Promise<number>` that resolves to the event
   * id when the event fires — useful for `await`-based sequencing.
   *
   * The returned id can be passed to `cancel` to abort before it fires.
   */
  scheduleOnce(time: number, callback?: () => void): number | Promise<number> {
    // increment for the next event
    this.eventId++;

    // grab the current value of the event id
    const newEventId = this.eventId;

    // create a dummy buffer to trigger the event
    const dummyBuffer = this.audioCtx.createBuffer(1, 1, 44100);
    const dummySource = this.audioCtx.createBufferSource();
    dummySource.buffer = dummyBuffer;
    dummySource.connect(this.audioCtx.destination);

    // add to schedule queue
    this.queue.push({
      id: newEventId,
      time,
      type: "single",
      source: dummySource,
    });

    // clamp so a target time within one buffer-length of zero can't produce a
    // negative start time (which throws)
    const startTime = Math.max(0, time - dummyBuffer.duration);

    if (callback) {
      dummySource.onended = () => {
        callback();
        this.cancel(newEventId); // ensures GC
      };

      // start buffer
      dummySource.start(startTime);

      return newEventId;
    } else {
      const promise = new Promise<number>(
        (resolve) =>
          (dummySource.onended = () => {
            this.cancel(newEventId); // self-clean, like the callback path
            resolve(newEventId);
          })
      );

      // start buffer
      dummySource.start(startTime);

      return promise;
    }
  }

  incrementRepeating(event: RepeatingEvent): void {
    event.count++;
    // the web audio spec doesn't allow buffer source nodes to be reused
    const dummySource = this.audioCtx.createBufferSource();
    dummySource.buffer = event.source.buffer;
    dummySource.connect(this.audioCtx.destination);
    dummySource.onended = () => {
      event.callback();
      // add the next occurence
      this.incrementRepeating(event);
    };
    dummySource.start(
      event.time + event.count * event.frequency - dummySource.buffer!.duration
    );
    event.source = dummySource;
  }

  /**
   * Schedule a repeating event starting at `time` (AudioContext seconds, absolute).
   *
   * @param frequency Seconds between each firing.
   * @returns An id for `cancel` / `updateCallback`.
   */
  scheduleRepeating(time: number, frequency: number, callback: () => void): number {
    // create a dummy buffer to trigger the event
    const dummyBuffer = this.audioCtx.createBuffer(1, 1, 44100);
    const dummySource = this.audioCtx.createBufferSource();
    dummySource.buffer = dummyBuffer;
    dummySource.connect(this.audioCtx.destination);

    // grab the next event id value
    const newEvent: RepeatingEvent = {
      id: ++this.eventId,
      count: 0,
      time,
      frequency,
      type: "repeating",
      callback,
      source: dummySource,
    };

    // assign callback
    dummySource.onended = () => {
      callback();
      // add the next occurence
      this.incrementRepeating(newEvent);
    };

    dummySource.start(
      // ensure the start time is positive
      Math.max(0, time - dummyBuffer.duration)
    );

    // initialize the event queue with the first event
    this.queue.push(newEvent);

    return newEvent.id;
  }

  updateCallback(id: number, callback: () => void): void {
    const event = this.getEvent(id);
    if (event) {
      const re = event as RepeatingEvent;
      re.callback = callback;
      re.source.onended = () => {
        callback();
        // add the next occurence
        this.incrementRepeating(re);
      };
    }
  }

  /** Returns `false` (not `undefined`) when the event isn't found. */
  getEvent(id: number): SchedulerEvent | false {
    const event = this.queue.find((e) => e.id === id);
    return event || false;
  }

  clear(): void {
    this.queue.forEach((event) => {
      event.source.onended = null;
      event.source.stop();
      event.source.disconnect();
    });
    this.queue.length = 0;
  }

  /** Cancels the event with the given id. No-op if `id` is `undefined` or not found. */
  cancel(id?: number): void {
    if (typeof id !== "undefined") {
      const event = this.getEvent(id);

      if (event) {
        event.source.onended = null;

        try {
          event.source.stop();
          /* eslint-disable-next-line */
        } catch (e) {}

        event.source.disconnect();
        this.queue = this.queue.filter((e) => e.id !== event.id);
      }
    }
  }
}

export default Scheduler;
