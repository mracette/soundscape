export class Scheduler {
  constructor(audioCtx) {
    // bind audio context
    this.audioCtx = audioCtx;

    // for events
    this.queue = [];

    // event id
    this.eventId = 0;
  }

  scheduleOnce(time, callback) {
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

    if (callback) {
      dummySource.onended = () => {
        callback();
        this.cancel(newEventId); // ensures GC
      };

      // start buffer
      dummySource.start(time - dummyBuffer.duration);

      return newEventId;
    } else {
      const promise = new Promise(
        (resolve) =>
          (dummySource.onended = () => {
            resolve(newEventId);
          })
      );

      // start buffer
      dummySource.start(time - dummyBuffer.duration);

      return promise;
    }
  }

  /* 
  Increment a repeating event
  */
  incrementRepeating(event) {
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
      event.time + event.count * event.frequency - dummySource.buffer.duration
    );
    event.source = dummySource;
  }

  /* 
  Initialized a repeating event
  */
  scheduleRepeating(time, frequency, callback) {
    // create a dummy buffer to trigger the event
    const dummyBuffer = this.audioCtx.createBuffer(1, 1, 44100);
    const dummySource = this.audioCtx.createBufferSource();
    dummySource.buffer = dummyBuffer;
    dummySource.connect(this.audioCtx.destination);

    // grab the next event id value
    const newEvent = {
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

  updateCallback(id, callback) {
    const event = this.getEvent(id);
    if (event) {
      event.callback = callback;
      event.source.onended = () => {
        callback();
        // add the next occurence
        this.incrementRepeating(event);
      };
    }
  }

  getEvent(id) {
    let event = this.queue.find((e) => e.id === id);
    return event || false;
  }

  clear() {
    this.queue.forEach((event) => {
      event.source.onended = null;
      event.source.stop();
      event.source.disconnect();
    });
    this.queue.length = 0;
  }

  cancel(id) {
    if (typeof id !== "undefined") {
      const event = this.getEvent(id);

      if (event) {
        event.source.onended = null;

        try {
          event.source.stop();
          /* eslint-disable-next-line no-empty */
        } catch (e) {}

        event.source.disconnect();
        this.queue = this.queue.filter((e) => e.id !== event.id);
      }
    }
  }
}

export default Scheduler;
