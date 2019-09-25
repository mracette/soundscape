
class Scheduler {

    constructor(audioCtx) {

        this.audioCtx = audioCtx
        this.queue = [];

    }

    scheduleOnce(time, name, callback) {

        console.log('scheduling once', time);

        // create a dummy buffer to trigger the event
        const dummyBuffer = this.audioCtx.createBuffer(1, 1, 44100);
        const dummySource = this.audioCtx.createBufferSource();
        dummySource.buffer = dummyBuffer;

        // add to schedule queue
        this.queue.push({
            name: name || null, 
            time,
            source: dummySource
        });

        if(callback) {

            dummySource.onended = callback;

            // start buffer
            dummySource.start(time - dummyBuffer.duration);

        } else {

            const promise = new Promise(resolve => dummySource.onended = resolve);

            // start buffer
            dummySource.start(time - dummyBuffer.duration);

            return promise

        }

    }

    clear() {

        this.queue.map((event) => {
            event.source.onended = null;
            event.source.stop();
        });

        this.queue = [];

    }

    cancel(name, time) {

        for(let i = this.queue.length - 1; i >= 0; i--) {

            const event = this.queue[i];
            const nameMatch = name && !time && event.name === name;
            const timeMatch = !name && time && event.time === time;
            const nameTimeMatch = name && time && event.name === name && event.time === time;

            if(nameMatch || timeMatch || nameTimeMatch) {
                event.source.onended = null;
                event.source.stop();
                this.queue.splice(i,1);
            }

        }

    }

}

export default Scheduler;