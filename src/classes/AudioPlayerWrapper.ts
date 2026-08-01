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
  /** AudioContext time passed to the last start(); null until first start. Kept
   *  through stop() — a scheduled stop leaves the voice audible until the
   *  boundary, and active-set logic lives in the music-player store. */
  startedAt: number | null = null;
  /** Buffer offset (seconds, already wrapped modulo the loop) passed to the
   *  last start() — the transport starts voices mid-loop when a toggle lands
   *  inside the lookahead window. Kept through stop(), like startedAt. */
  startOffset = 0;
  playbackRate = 1;
  /** True from `start()` until `stop()`; gates AudioParam work in `setPlaybackRate`. */
  private playing = false;
  /**
   * Whether `bufferSource` is wired to `destination`. Needed because a
   * never-started source that has been `disconnect()`ed (song unmount cleans up
   * voices it never played, and the engine singleton keeps the instances for
   * the next visit) will `start()` successfully but inaudibly — the spec only
   * throws on reuse — so the throw → reload fallback never engages.
   */
  private connected = false;

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
          this.connected = true;
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  disconnect(): void {
    this.bufferSource.disconnect();
    this.connected = false;
  }

  /**
   * Start playback at `time` (AudioContext seconds, absolute), optionally
   * `offsetSeconds` into the buffer. The offset is mapped modulo the buffer
   * length, so the transport can pass "seconds of playback elapsed since the
   * grid boundary" directly to join a loop mid-cycle, exactly in phase, when
   * its boundary can no longer be started sample-accurately.
   * If the underlying `BufferSourceNode` has already been started, reloads a
   * fresh one before starting — this is the normal path after the first play.
   * A pristine-but-disconnected source (disconnected on a previous visit's
   * unmount, never played) is also reloaded first: its `start()` would succeed
   * without producing any sound.
   */
  start(time: number, offsetSeconds = 0): void {
    if (!this.connected) {
      this.reload();
    }
    const offset = offsetSeconds % this.bufferSource.buffer!.duration;
    try {
      // Seed the rate as the source's base value (not an event pinned at `time`),
      // so a Time Warp change between scheduling and `time` still governs the rate the
      // voice comes in at — otherwise it starts at a stale rate (wrong pitch+tempo).
      this.bufferSource.playbackRate.value = this.playbackRate;
      this.bufferSource.start(time, offset);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      this.reload();
      this.bufferSource.start(time, offset);
    }
    this.playing = true;
    this.startedAt = time;
    this.startOffset = offset;
  }

  /**
   * Set this voice's playback rate (pitch + tempo) at AudioContext time `atTime`.
   * With `glideSeconds > 0`, the rate ramps linearly from the param's current
   * value to `rate` over that window (anchored with setValueAtTime so
   * consecutive ramps chain continuously instead of zippering).
   *
   * The rate is always recorded so a later `start()` seeds the live value, but
   * AudioParam automation only touches a playing source — automating stopped or
   * not-yet-started nodes is wasted work (a fresh node is seeded on start).
   */
  setPlaybackRate(rate: number, atTime: number, glideSeconds = 0): void {
    // Buffer position is the integral of rate over time, so consumers that
    // compute it as (now − startedAt) · playbackRate (stemProvider) are only
    // correct if the clock re-bases at every rate change: fold the segment
    // played at the old rate into startOffset and restart the clock at atTime.
    // A not-yet-started voice (atTime ≤ startedAt) needs no re-base — the new
    // rate simply applies from the start. Glides make this piecewise-constant
    // bookkeeping approximate, but only within the short glide window.
    if (this.playing && this.startedAt !== null && atTime > this.startedAt) {
      const duration = this.bufferSource.buffer?.duration;
      if (duration) {
        this.startOffset =
          (this.startOffset + (atTime - this.startedAt) * this.playbackRate) % duration;
        this.startedAt = atTime;
      }
    }
    this.playbackRate = rate;
    if (!this.playing) return;
    const param = this.bufferSource.playbackRate;
    if (glideSeconds > 0) {
      param.setValueAtTime(param.value, atTime);
      param.linearRampToValueAtTime(rate, atTime + glideSeconds);
    } else {
      param.setValueAtTime(rate, atTime);
    }
  }

  /** Stop at `time` (AudioContext seconds). Omit to stop immediately. */
  stop(time?: number): void {
    this.playing = false;
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
    this.connected = true;
  }

  /** Loop length in seconds (buffer duration), or null before init resolves. */
  get loopDuration(): number | null {
    return (this.bufferSource as AudioBufferSourceNode | undefined)?.buffer?.duration ?? null;
  }
}
