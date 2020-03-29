export class Scheduler {
  constructor(audioCtx) {
    // bind audio context
    this.audioCtx = audioCtx;

    // for scheduleOnce
    this.queue = [];

    // for scheduleRepeating
    this.repeatingQueue = [];

    // event id
    this.eventId = 0;
  }

  scheduleOnce(time, name, callback) {
    // increment for the next event
    this.eventId++;

    // grab the current value of the event id
    const newEventId = this.eventId;

    // create a dummy buffer to trigger the event
    const dummyBuffer = this.audioCtx.createBuffer(1, 1, 44100);
    const dummySource = this.audioCtx.createBufferSource();
    dummySource.buffer = dummyBuffer;

    // add to schedule queue
    this.queue.push({
      id: newEventId,
      name: name || null,
      time,
      type: "single",
      source: dummySource,
    });

    if (callback) {
      dummySource.onended = callback;

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

  scheduleRepeating(time, frequency, callback) {
    // increment for the next event
    this.eventId++;

    // grab the current value of the event id
    const newEventId = this.eventId;

    // create a dummy buffer to trigger the event
    const dummyBuffer = this.audioCtx.createBuffer(1, 1, 44100);
    const dummySource = this.audioCtx.createBufferSource();
    dummySource.buffer = dummyBuffer;

    // assign callback
    dummySource.onended = () => {
      callback();
      // add the next occurence
      const { time, frequency } = this.getEvent(newEventId);
      this.scheduleRepeating(time + frequency, frequency, callback);
    };

    dummySource.start(
      // ensure the start time is positive
      Math.max(0, time - dummyBuffer.duration)
    );

    // initialize the event queue with the first event
    this.repeatingQueue.push({
      id: newEventId,
      time,
      type: "repeating",
      frequency,
      source: dummySource,
    });

    return newEventId;
  }

  updateCallback(id, callback) {
    let event;

    event = this.queue.find((e) => e.id === id);

    if (!event) {
      event = this.repeatingQueue.find((e) => e.id === id);
    }

    if (event) {
      event.source.onended = callback;
    }
  }

  updateQueue() {
    for (let i = this.repeatingQueue.length - 1; i >= 0; i--) {
      const event = this.repeatingQueue[i];

      if (event.time < this.audioCtx.currentTime) {
        this.repeatingQueue.splice(i, 1);

        // create a dummy buffer to trigger the event
        const dummyBuffer = this.audioCtx.createBuffer(1, 1, 44100);
        const dummySource = this.audioCtx.createBufferSource();
        dummySource.buffer = dummyBuffer;

        // assign callback (same as previous event)
        dummySource.onended = event.source.onended;

        // start
        dummySource.start(
          // ensure the start time is positive
          Math.max(0, event.time + event.frequency - dummyBuffer.duration)
        );

        // update the parameters and push a copy of the event to the queue
        this.repeatingQueue.push({
          id: event.id,
          time: event.time + event.frequency,
          type: "repeating",
          frequency: event.frequency,
          source: dummySource,
        });
      }
    }
  }

  getEvent(id) {
    let event = this.queue.find((e) => e.id === id);

    if (event) {
      return event;
    } else {
      let event = this.repeatingQueue.find((e) => e.id === id);
      if (event) {
        return event;
      } else {
        return false;
      }
    }
  }

  clear() {
    this.queue.forEach((event) => {
      event.source.onended = null;
      event.source.stop();
    });

    this.repeatingQueue.forEach((event) => {
      event.source.onended = null;
      event.source.stop();
    });

    this.queue = [];
    this.repeatingQueue = [];
  }

  cancel(id) {
    if (typeof id !== "undefined") {
      const event = this.getEvent(id);

      if (event) {
        event.source.onended = null;
        event.source.stop();

        this.queue = this.queue.filter((e) => e.id !== event.id);
        this.repeatingQueue = this.repeatingQueue.filter(
          (e) => e.id !== event.id
        );
      }
    }
  }
}

export default Scheduler;
