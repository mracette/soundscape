import { createAudioPlayer } from "../utils/audioUtils";

interface AudioPlayerOptions {
  destination?: AudioNode;
  renderLength?: number | null;
  offlineRendering?: boolean;
  fade?: boolean;
  fadeLength?: number;
  loop?: boolean;
}

export class AudioPlayerWrapper {
  context: AudioContext;
  path: string;
  // Fields set via Object.assign from defaults+options; TS can't see that, so use !
  destination!: AudioNode;
  renderLength!: number | null;
  offlineRendering!: boolean;
  fade!: boolean;
  fadeLength!: number;
  loop!: boolean;
  bufferSource!: AudioBufferSourceNode;

  constructor(context: AudioContext, path: string, options: AudioPlayerOptions) {
    // bind
    this.context = context;
    this.path = path;

    // defaults
    const defaults: Required<AudioPlayerOptions> = {
      destination: context.destination,
      renderLength: null,
      offlineRendering: true,
      fade: true,
      fadeLength: 0.001,
      loop: true,
    };

    Object.assign(this, { ...defaults, ...options });
  }

  init(): Promise<void> {
    return new Promise((resolve, reject) => {
      // setup
      createAudioPlayer(this.context, this.path, {
        offlineRendering: this.offlineRendering,
        renderLength: this.renderLength ?? undefined,
        fade: this.fade,
        fadeLength: this.fadeLength,
      })
        .then((bufferSource) => {
          bufferSource.disconnect();
          bufferSource.loop = this.loop;
          bufferSource.loopStart = 0;
          bufferSource.loopEnd = bufferSource.buffer!.duration;
          bufferSource.connect(this.destination);
          this.bufferSource = bufferSource;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  disconnect(): void {
    this.bufferSource.disconnect();
  }

  start(time: number): void {
    try {
      this.bufferSource.start(time);
    } catch (err) {
      this.reload();
      this.bufferSource.start(time);
    }
  }

  stop(time: number): void {
    try {
      this.bufferSource.stop(time);
    } catch (err) {
      return;
    }
  }

  reload(): void {
    // disconnect buffer source to allow garbage collection
    this.disconnect();

    const newSource = this.context.createBufferSource();
    newSource.buffer = this.bufferSource.buffer;
    newSource.loop = this.loop;
    newSource.loopStart = 0;
    newSource.loopEnd = this.bufferSource.buffer!.duration;
    newSource.connect(this.destination);

    this.bufferSource = newSource;
  }
}
