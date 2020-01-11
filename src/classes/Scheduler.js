export class Scheduler {

    constructor(audioCtx) {

        // bind audio context
        this.audioCtx = audioCtx

        // flag that triggers repeating events 
        this.flagRepeating = false;

        // by default keep 1 event in the repeating queue
        this.scheduleAheadCount = 1;

        // for scheduleOnce
        this.queue = [];

        // for scheduleRepeating
        this.repeatingQueue = [];

        // event id
        this.eventId = 0;

    }

    scheduleOnce(time, name, callback) {

        // grab the current value of the event id
        const newEventId = this.eventId;

        // increment for the next event
        this.eventId++;

        // create a dummy buffer to trigger the event
        const dummyBuffer = this.audioCtx.createBuffer(1, 1, 44100);
        const dummySource = this.audioCtx.createBufferSource();
        dummySource.buffer = dummyBuffer;

        // add to schedule queue
        this.queue.push({
            id: this.eventId,
            name: name || null,
            time,
            type: 'single',
            source: dummySource
        });

        this.eventId++;

        if (callback) {

            dummySource.onended = callback;

            // start buffer
            dummySource.start(time - dummyBuffer.duration);

            return newEventId;

        } else {

            const promise = new Promise(resolve => dummySource.onended = () => { resolve(newEventId) });

            // start buffer
            dummySource.start(time - dummyBuffer.duration);

            return promise;

        }

    }

    scheduleRepeating(time, frequency, callback) {

        // grab the current value of the event id
        const newEventId = this.eventId;

        // increment for the next event
        this.eventId++;

        // create a dummy buffer to trigger the event
        const dummyBuffer = this.audioCtx.createBuffer(1, 1, 44100);
        const dummySource = this.audioCtx.createBufferSource();
        dummySource.buffer = dummyBuffer;

        // assign callback
        dummySource.onended = callback;

        // create timer
        const timer = window.setInterval(() => { this.updateQueue() }, (frequency / 4) * 1000);

        dummySource.start(
            // ensure the start time is positive
            Math.max(0, time - dummyBuffer.duration)
        );

        // initialize the event queue with the first event
        this.repeatingQueue.push({
            id: newEventId,
            time,
            type: 'repeating',
            frequency,
            timer,
            source: dummySource
        });

        return newEventId;

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
                    status: event.status,
                    id: event.id,
                    time: event.time + event.frequency,
                    type: 'repeating',
                    frequency: event.frequency,
                    timer: event.timer,
                    source: dummySource
                });

            }

        }

    }

    clear() {

        this.queue.map((event) => {
            event.source.onended = null;
            event.source.stop();
        });

        this.repeatingQueue.map((event) => {
            window.clearInterval(event.timer);
            event.source.onended = null;
            event.source.stop();
        })

        this.queue = [];
        this.repeatingQueue = [];

    }

    cancel(id) {

        for (let i = this.repeatingQueue.length - 1; i >= 0; i--) {

            const event = this.repeatingQueue[i];

            if (event.id === id) {
                window.clearInterval(event.timer);
                event.source.onended = null;
                event.source.stop();
                this.queue.splice(i, 1);
            }

        }

        for (let i = this.queue.length - 1; i >= 0; i--) {

            const event = this.queue[i];

            if (event.id === id) {
                event.source.onended = null;
                event.source.stop();
                this.queue.splice(i, 1);
            }

        }

    }

}

export default Scheduler;