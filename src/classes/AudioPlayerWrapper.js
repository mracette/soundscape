export class AudioPlayerWrapper {
  constructor(context, bufferSource, options) {
    // bind
    this.context = context;
    this.bufferSource = bufferSource;
    this.buffer = this.bufferSource.buffer;

    // defaults
    const defaults = {
      destination: context.destination,
      loop: true,
    };

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
    try {
      this.bufferSource.start(time);
    } catch (err) {
      this.reload();
      this.bufferSource.start(time);
    }
  }

  stop(time) {
    try {
      this.bufferSource.stop(time);
    } catch (err) {
      console.log(err);
    }
  }

  reload() {
    // disconnect buffer source to allow garbage collection
    this.disconnect();

    const newSource = this.context.createBufferSource();
    newSource.buffer = this.buffer;
    newSource.loop = this.loop;
    newSource.loopStart = 0;
    newSource.loopEnd = this.buffer.duration;
    newSource.connect(this.destination);

    this.bufferSource = newSource;
  }
}
