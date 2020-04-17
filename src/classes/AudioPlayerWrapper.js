import { createAudioPlayer } from "crco-utils";

export class AudioPlayerWrapper {
  constructor(context, path, options) {
    // bind
    this.context = context;
    this.path = path;

    // defaults
    const defaults = {
      destination: context.destination,
      renderLength: null,
      offlineRendering: true,
      fade: true,
      fadeLength: 0.001,
      loop: true,
    };

    Object.assign(this, { ...defaults, ...options });
  }

  init() {
    return new Promise((resolve, reject) => {
      // setup
      createAudioPlayer(this.context, this.path, {
        offlineRendering: this.offlineRendering,
        renderLength: this.renderLength,
        fade: this.fade,
        fadeLength: this.fadeLength,
      })
        .then((bufferSource) => {
          bufferSource.disconnect();
          bufferSource.loop = this.loop;
          bufferSource.loopStart = 0;
          bufferSource.loopEnd = bufferSource.buffer.duration;
          bufferSource.connect(this.destination);
          this.bufferSource = bufferSource;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
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
      return;
    }
  }

  reload() {
    // disconnect buffer source to allow garbage collection
    this.disconnect();

    const newSource = this.context.createBufferSource();
    newSource.buffer = this.bufferSource.buffer;
    newSource.loop = this.loop;
    newSource.loopStart = 0;
    newSource.loopEnd = this.bufferSource.buffer.duration;
    newSource.connect(this.destination);

    this.bufferSource = newSource;
  }
}
