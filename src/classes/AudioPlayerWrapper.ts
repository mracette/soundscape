import { createAudioPlayer } from "../utils/audioUtils";

interface AudioPlayerOptions {
  destination?: AudioNode;
  renderLength?: number | null;
  offlineRendering?: boolean;
  fade?: boolean;
  fadeLength?: number;
  loop?: boolean;
}

/**
 * Wraps a single looping audio voice in the WebAudio graph.
 *
 * On `init`, the audio file is fetched and — when `offlineRendering` is true —
 * rendered through an `OfflineAudioContext` with a fade applied at the loop
 * boundary. That pre-render bakes the fade into the buffer so that looping
 * is click-free without real-time processing on every cycle.
 *
 * A `BufferSourceNode` is single-use by spec: once started it cannot be
 * restarted. `start()` reuses the existing node and falls back to `reload()`
 * (which builds a fresh node from the same buffer) if the node has already
 * been used.
 */
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
  playbackRate = 1;

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

  /**
   * Fetch and (optionally) offline-render the audio buffer. Must be awaited
   * before calling `start`; `bufferSource` is not valid until this resolves.
   */
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

  /**
   * Start playback at `time` (AudioContext seconds, absolute).
   * If the underlying `BufferSourceNode` has already been started, reloads a
   * fresh one before starting — this is the normal path after the first play.
   */
  start(time: number): void {
    try {
      // Seed the rate as the source's base value (not an event pinned at `time`),
      // so a Time Warp change between scheduling and `time` still governs the rate the
      // voice comes in at — otherwise it starts at a stale rate (wrong pitch+tempo).
      this.bufferSource.playbackRate.value = this.playbackRate;
      this.bufferSource.start(time);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      this.reload();
      this.bufferSource.start(time);
    }
  }

  /** Set this voice's playback rate (pitch + tempo) at AudioContext time `atTime`. */
  setPlaybackRate(rate: number, atTime: number): void {
    this.playbackRate = rate;
    try {
      this.bufferSource.playbackRate.setValueAtTime(rate, atTime);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Node not started yet; the field is applied on start().
    }
  }

  /** Stop at `time` (AudioContext seconds). Omit to stop immediately. */
  stop(time?: number): void {
    try {
      this.bufferSource.stop(time);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    newSource.playbackRate.value = this.playbackRate;
    newSource.connect(this.destination);

    this.bufferSource = newSource;
  }
}
