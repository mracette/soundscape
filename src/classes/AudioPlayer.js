
export class AudioPlayer {

    constructor(context, bufferSource, options) {

        // bind
        this.context = context;
        this.bufferSource = bufferSource;

        // defaults
        const defaults = {
            bpm: 120,
            loopLengthBeats: 4 * 4,
            destination: context.destination,
            fades: false,
            loop: true
        }

        Object.assign(this, { ...defaults, ...options });

        // setup
        this.secondsPerBeat = 60 / this.bpm;
        this.loopLengthSeconds = this.loopLengthBeats * this.secondsPerBeat;
        this.bufferSource.loop = this.loop;
        this.bufferSource.loopStart = 0;
        this.bufferSource.loopEnd = bufferSource.buffer.duration;
        this.bufferSource.connect(this.destination);

    }

    start(time) {
        this.bufferSource.start(time);
        this.bufferSource.onended = () => this.reload();
    }

    stop(time) {
        this.bufferSource.stop(time);
    }

    reload() {
        const newSource = this.context.createBufferSource();
        newSource.buffer = this.bufferSource.buffer;
        newSource.connect(this.destination);
        this.bufferSource = newSource;
    }

}