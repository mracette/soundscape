
export class AudioLooper {

    constructor(audioCtx, buffer, params) {
        
        this.bpm = params.bpm || 120;
        this.secondsPerBeat = 60 / this.bpm;
        this.snapToGrid = params.snapToGrid || true;
        
        this.loopLengthBeats = params.loopLengthBeats || 4 * 4;
        this.loopLengthSeconds = this.loopLengthBeats * this.secondsPerBeat;

        this.refreshRate = params.refreshRate || (this.loopLengthSeconds / 4) * 1000;
        this.fadeInTime = params.fadeInTime || this.secondsPerBeat / 32;
        this.fadeOutTime = params.fadeOutTime || this.secondsPerBeat / 32;
        
        this.audioCtx = audioCtx;
        this.destination = params.destination || audioCtx.destination;
        this.buffer = buffer;
        this.queue = [];
        this.garbage = [];

        this.intervalTimer = undefined;
        this.activeEventTime = undefined;
        this.prevEventTime = undefined;

        this.scheduledEvents = [];
        
    }
    
    addEventToQueue(time, onstart) {

        // create a gain node to govern fades
        const gainNode = this.audioCtx.createGain();
        gainNode.connect(this.destination);

        // a new buffer source must be created for each loop
        const bufferSource = this.audioCtx.createBufferSource();
        bufferSource.buffer = this.buffer;
        bufferSource.connect(gainNode);
        
        // if defined, add an event listener to the buffer source before starting
        if(onstart) {
            // unfortunately, there is only an 'onended' event for buffer sources, which is exploited here with
            // a very short dummy buffer source to create an 'onstart' event for the main buffer source
            const dummyBuffer = this.audioCtx.createBuffer(1, 1, 44100);
            const dummySource = this.audioCtx.createBufferSource();
            dummySource.buffer = dummyBuffer;
            dummySource.onended = onstart;
            dummySource.start(time - dummyBuffer.duration);
        }

        bufferSource.start(time, 0, this.loopLengthSeconds);

        // create anchor for fade in
        gainNode.gain.setValueAtTime(0.001, time);

        // ramp up to default
        gainNode.gain.exponentialRampToValueAtTime(1, time + this.fadeInTime);

        // create anchor for fade out
        gainNode.gain.setValueAtTime(1, time + this.loopLengthSeconds - this.fadeOutTime);

        // ramp down to min
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + this.loopLengthSeconds);

        this.queue.push({
            bufferSource,
            gainNode,
            time
        });

    }

    updateQueue() {   

        for(let i = this.queue.length - 1; i >= 0; i--) {
           
           // remove event from queue if start time is in the past
            if(this.queue[i].time < this.audioCtx.currentTime) {
                
                // grab last event time
                this.prevEventTime = this.queue[i].time;
                
                // move to garbage collection queue
                this.garbage.push(this.queue.splice(i,1)[0]);
                
            }

        };

        for(let i = this.garbage.length - 1; i >= 0; i--) {
            
            // disconnect nodes to ensure proper garbage collection
            if(this.garbage[i].time + this.loopLengthSeconds < this.audioCtx.currentTime) {
                                
                // disconnect nodes
                this.garbage[i].bufferSource.disconnect();
                this.garbage[i].gainNode.disconnect();

                // grab last event
                this.garbage.splice(i,1);
                
            }

        };

        // schedule next event
        while(this.queue.length < 1) {
            const nextEventTime = this.prevEventTime + this.loopLengthSeconds;
            this.addEventToQueue(nextEventTime);
        }

    }

    start(quantizeStartTime, onstart) {

        // calculate the next event time
        this.activeEventTime = this.snapToGrid && quantizeStartTime ? quantizeStartTime : this.audioCtx.currentTime;

        // add the first event to the queue
        this.addEventToQueue(this.activeEventTime, onstart);

        // listen for future events
        this.intervalTimer = window.setInterval(() => { this.updateQueue() }, this.refreshRate);

    }

    stop(quantizeStopTime) {

        return new Promise((resolve, reject) => {

            try {

                // stop scheduling new events
                if(this.intervalTimer) { window.clearInterval(this.intervalTimer); }

                // stop all events in both queues
                this.queue.map((event) => {
                    if(quantizeStopTime) {
                        event.bufferSource.stop(quantizeStopTime);
                    } else {
                        event.bufferSource.stop();
                    }
                })

                this.garbage.map((event) => {
                    if(quantizeStopTime) {
                        event.bufferSource.stop(quantizeStopTime);
                    } else {
                        event.bufferSource.stop();
                    }
                })

                // create a dummy buffer to trigger the promise and cleanup
                const dummyBuffer = this.audioCtx.createBuffer(1, 1, 44100);
                const dummySource = this.audioCtx.createBufferSource();
                dummySource.buffer = dummyBuffer;

                dummySource.onended = () => {

                    // cleanup queue
                    this.queue.map((event) => {
                        event.bufferSource.disconnect();
                        event.gainNode.disconnect();
                        event.bufferSource.stop();
                    });

                    // cleanup garbage
                    this.garbage.map((event) => {
                        event.bufferSource.disconnect();
                        event.gainNode.disconnect();
                        event.bufferSource.stop();
                    });

                    // resolve promise
                    resolve();

                }

                // start buffer at the appropriate time
                if(quantizeStopTime) {
                    dummySource.start(quantizeStopTime - dummyBuffer.duration);
                } else {
                    dummySource.start();
                }

            } catch (err) {

                reject(err);

            }
     
        });

    }

    schedule(quantizeStartTime) {

        return new Promise((resolve, reject) => {

            try {
                
                // create a dummy buffer to trigger the event
                const dummyBuffer = this.audioCtx.createBuffer(1, 1, 44100);
                const dummySource = this.audioCtx.createBufferSource();
                dummySource.buffer = dummyBuffer;

                // add listener
                dummySource.onended = () => resolve();

                // start buffer
                dummySource.start(quantizeStartTime - dummyBuffer.duration);

                // add to schedule queue
                this.scheduledEvents.push(dummySource);

            } catch (err) {

                reject(err);

            }

        });

    }

    cancel() {

        this.scheduledEvents.map((event) => {

            event.onended = null;
            event.stop();

        });

        this.scheduledEvents = [];

    }

}