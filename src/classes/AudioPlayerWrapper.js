
export class AudioPlayerWrapper {

    constructor(context, bufferSource, options) {

        // bind
        this.context = context;
        this.bufferSource = bufferSource;

        // defaults
        const defaults = {
            destination: context.destination,
            loop: true
        }

        Object.assign(this, { ...defaults, ...options });

        // setup
        this.bufferSource.loop = this.loop;
        this.bufferSource.loopStart = 0;
        this.bufferSource.loopEnd = bufferSource.buffer.duration;
        this.bufferSource.connect(this.destination);

    }

    disconnect() {
        this.bufferSource.disconnect();
    }

    start(time) {
        this.bufferSource.start(time);
        this.bufferSource.onended = () => this.reload();
    }

    stop(time) {
        try {
            this.bufferSource.stop(time);
        } catch (err) {
            console.log(err)
        }
    }

    reload() {
        const newSource = this.context.createBufferSource();
        newSource.buffer = this.bufferSource.buffer;
        newSource.loop = this.loop;
        newSource.loopStart = 0;
        newSource.loopEnd = newSource.buffer.duration;
        newSource.connect(this.destination);
        this.bufferSource = newSource;
    }

}