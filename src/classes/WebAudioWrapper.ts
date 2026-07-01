import {
  initGain,
  initHighpass,
  initLowpass,
  effectParams,
  getPathToAudio,
} from "../utils/audioUtils";

import { loadArrayBuffer } from "../utils/audioUtils";
import { Analyser } from "./Analyser";
import { Scheduler } from "./Scheduler";
import { AudioPlayerWrapper } from "./AudioPlayerWrapper";
import { TempoClock } from "./TempoClock";
import {
  SongContextValue,
  AppConfigEntry,
  SongId,
} from "../contexts/contexts";

interface AppEffects {
  premaster: GainNode;
  effectsChainEntry: GainNode;
  effectsChainExit: GainNode;
  hpFilter: BiquadFilterNode;
  lpFilter: BiquadFilterNode;
  reverbDry: GainNode;
  reverbWet: GainNode;
  reverb: ConvolverNode;
}

interface SongEffects {
  groupNodes: Record<string, GainNode>;
}

interface SongAnalysers {
  groupAnalysers: Record<string, Analyser>;
}

type NodesEffects = AppEffects & Partial<Record<SongId, SongEffects>>;
type NodesAnalysers = { premaster?: Analyser } & Partial<Record<SongId, SongAnalysers>>;
type NodesVoices = Partial<Record<SongId, Record<string, AudioPlayerWrapper>>>;

interface WrapperNodes {
  effects: NodesEffects;
  analysers: NodesAnalysers;
  voices: NodesVoices;
}

interface FilterValue {
  f: number;
  q: number;
}

interface WrapperValues {
  FADE_LENGTH: number;
  FADE_LENGTH_AMBIENT: number;
  NUM_EFFECT_VALUES: number;
  lp: FilterValue[];
  hp: FilterValue[];
  am: number[];
}

interface TransportRequest {
  player: AudioPlayerWrapper;
  clock: TempoClock;
  targetBeat: number;
  action: "start" | "stop";
  onCommit: (time: number) => void;
  onRetime?: (time: number) => void;
}

/** Poll period and commit horizon (seconds) for the boundary transport. */
const TRANSPORT_TICK = 0.015;
const TRANSPORT_LOOKAHEAD = 0.04;

/**
 * Central audio engine. Owns the AudioContext, Scheduler, and the entire WebAudio
 * node graph for the app.
 *
 * Two-phase lifecycle:
 *   1. `initAppState()` — called once per session. Builds the persistent effects chain
 *      (filters, reverb, premaster) and the premaster analyser. Guarded by `status.app`.
 *   2. `initSongState(id)` — called per song, lazily. Builds that song's group gain nodes,
 *      per-group analysers, and voice players. Guarded by `status[id]`.
 *
 * Song voices route through their group's GainNode → effectsChainEntry → (effects chain)
 * → premaster → AudioContext.destination.
 */
export class WebAudioWrapper {
  config: Record<SongId, Omit<SongContextValue, "id">>;
  nodes: Partial<WrapperNodes>;
  values: WrapperValues;
  status: Record<SongId, boolean>;
  audioCtx: AudioContext;
  scheduler: Scheduler;
  tempoClocks: Partial<Record<SongId, TempoClock>> = {};
  /**
   * Last commanded Time Warp rate per song. During a glide this is the audio
   * ramp's anchor (where the previous segment's ramp landed), which the clock's
   * midpoint rate must pair with `rate` — the clock's own `currentRate` is a
   * held midpoint mid-glide, and pairing midpoints compounds into a permanent
   * clock/audio phase offset.
   */
  private timeWarpTargets: Partial<Record<SongId, number>> = {};
  private transportQueue = new Map<string, TransportRequest>();
  private transportTick: number | null = null;

  constructor(appConfig: AppConfigEntry[]) {
    const props = {
      config: {} as Record<SongId, Omit<SongContextValue, "id">>,
      nodes: {} as Partial<WrapperNodes>,
      values: {
        FADE_LENGTH: 0.025,
        FADE_LENGTH_AMBIENT: 0.01,
        NUM_EFFECT_VALUES: 100,
      } as WrapperValues,
      status: {} as Record<SongId, boolean>,
    };

    const audioCtx = new AudioContext({
      latencyHint: "balanced",
    });

    const scheduler = new Scheduler(audioCtx);

    appConfig.forEach((songConfig) => {
      // move relevant portion of the app config to the classe's "config" property
      props.config[songConfig.id] = {
        ...songConfig.audio,
      };
      // initialize a status for the song's webaudio nodes
      props.status[songConfig.id] = false;
    });

    Object.assign(this, props, { audioCtx, scheduler });

    // Object.assign doesn't initialize these declared fields; set them explicitly
    this.config = props.config;
    this.nodes = props.nodes;
    this.values = props.values as WrapperValues;
    this.status = props.status;
    this.audioCtx = audioCtx;
    this.scheduler = scheduler;
  }

  /**
   * Builds the session-persistent WebAudio graph: effect values lookup tables,
   * the effects chain (filters → reverb dry/wet → premaster), and the premaster
   * analyser. The `status.app` guard makes repeated calls idempotent.
   */
  async initAppState(): Promise<boolean> {
    /*
     * These are WebAudio nodes that will be used across songs, and should persist
     * for the duration of the session.
     */
    if (!this.status.app) {
      await this._initAppEffectValues();
      await this._initAppEffects();
      await this._initAppAnalysers();
      this.status.app = true;
    }
    return true;
  }

  /**
   * Lazily builds per-song nodes: group GainNodes, per-group analysers (one for 3D
   * visualizations, one for oscilloscopes), and voice AudioPlayerWrappers. The
   * `status[id]` guard prevents re-initialization on repeat visits to the same song.
   */
  async initSongState(id: SongId): Promise<boolean> {
    /*
     * These are WebAudio nodes that are specific to the chosen song. They can
     * persist across the session to avoid re-initialization if a user re-visits
     * a page, but they can be lazily loaded.
     */
    if (!this.status[id]) {
      await this._initSongEffects(id);
      await this._initSongAnalysers(id);
      await this._initSongVoices(id);
      this.tempoClocks[id] = new TempoClock(this.config[id].bpm);
      this.status[id] = true;
    }
    return true;
  }

  /**
   * Wires the session-level effects chain and loads the convolver impulse response.
   *
   * Node routing:
   *   effectsChainEntry → lpFilter → hpFilter → reverbDry ─┐
   *                                           └→ reverbWet → reverb ─┘→ effectsChainExit → premaster → destination
   *
   * Each song's group GainNodes connect upstream to effectsChainEntry.
   * The reverb is a ConvolverNode loaded from an impulse-response wav; the promise
   * resolves only after that async decode completes.
   */
  _initAppEffects(): Promise<void> {
    return new Promise((resolve, reject) => {
      const effects = {} as AppEffects;

      // initialize
      effects.premaster = initGain(this.audioCtx, 1);
      effects.effectsChainEntry = initGain(this.audioCtx, 1);
      effects.effectsChainExit = initGain(this.audioCtx, 1);
      effects.hpFilter = initHighpass(this.audioCtx);
      effects.lpFilter = initLowpass(this.audioCtx);
      effects.reverbDry = initGain(this.audioCtx, 1);
      effects.reverbWet = initGain(this.audioCtx, 0);
      effects.reverb = this.audioCtx.createConvolver();

      // effects chain routing
      effects.effectsChainEntry.connect(effects.lpFilter);
      effects.lpFilter.connect(effects.hpFilter);
      effects.hpFilter.connect(effects.reverbDry);
      effects.hpFilter.connect(effects.reverbWet);
      effects.reverbDry.connect(effects.effectsChainExit);
      effects.reverbWet.connect(effects.reverb);
      effects.reverb.connect(effects.effectsChainExit);
      effects.effectsChainExit.connect(effects.premaster);
      effects.premaster.connect(this.audioCtx.destination);

      this.nodes.effects = effects as NodesEffects;

      // set initial filter values
      this.setEffects("lp", 100);
      this.setEffects("hp", 1);
      this.setEffects("am", 1);

      // impulse response for reverb
      const pathToAudio = getPathToAudio(
        "application",
        "impulse-response",
        "wav"
      );

      loadArrayBuffer(pathToAudio!)
        .then((arrayBuffer) => {
          this.audioCtx.decodeAudioData(arrayBuffer, (audioBuffer) => {
            effects.reverb.buffer = audioBuffer;
            resolve();
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  _initAppEffectValues(): void {
    /*
     * Exponential calculations are involved in finding effects values based off of
     * a linear scale. Here, we pre-calculate a set of discrete effects values to save
     * compute time later.
     */
    const hpValues: FilterValue[] = [];
    const lpValues: FilterValue[] = [];
    const amValues: number[] = [];

    for (
      let i = 0,
        f = effectParams.hpFilter.expFreqParams,
        q = effectParams.hpFilter.expQParams;
      i < this.values.NUM_EFFECT_VALUES;
      i++
    ) {
      hpValues.push({
        f: f.a * Math.pow(f.b, i),
        q: q.a * Math.pow(q.b, i),
      });
    }

    for (
      let i = 0,
        f = effectParams.lpFilter.expFreqParams,
        q = effectParams.lpFilter.expQParams;
      i < this.values.NUM_EFFECT_VALUES;
      i++
    ) {
      lpValues.push({
        f: f.a * Math.pow(f.b, i),
        q: q.a * Math.pow(q.b, i),
      });
    }

    for (
      let i = 0,
        min = effectParams.ambience.minWet,
        max = effectParams.ambience.maxWet;
      i < this.values.NUM_EFFECT_VALUES;
      i++
    ) {
      amValues.push((min + (max - min) * (i - 1)) / 99);
    }

    this.values.lp = lpValues;
    this.values.hp = hpValues;
    this.values.am = amValues;
  }

  _initAppAnalysers(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const analysers: NodesAnalysers = {};
        analysers.premaster = new Analyser(
          this.audioCtx,
          this.nodes.effects!.premaster,
          {
            id: `premaster-analyser`,
            power: 6,
            minDecibels: -120,
            maxDecibels: 0,
            smoothingTimeConstanct: 0.25,
          }
        );
        this.nodes.analysers = analysers;
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  _initSongEffects(id: SongId): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const groupNodes: Record<string, GainNode> = {};
        this.config[id].groups.forEach((group) => {
          groupNodes[group.name] = initGain(this.audioCtx, 1);
          groupNodes[group.name].connect(this.nodes.effects!.effectsChainEntry);
        });
        // Song effects stored as dynamic key on the effects object
        this.nodes.effects![id] = { groupNodes } as SongEffects;
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  _initSongAnalysers(id: SongId): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const groupAnalysers: Record<string, Analyser> = {};
        this.config[id].groups.forEach((group) => {
          const songEffects = this.nodes.effects![id] as SongEffects;
          // one analyser for 3D vizualizations
          groupAnalysers[group.name] = new Analyser(
            this.audioCtx,
            songEffects.groupNodes[group.name],
            {
              id: `${id}-${group.name}-analyser`,
              ...group.analyser,
            }
          );
          // one analyser for oscilloscopes
          groupAnalysers[group.name + "-osc"] = new Analyser(
            this.audioCtx,
            songEffects.groupNodes[group.name],
            {
              id: `${id}-${group.name}-analyser-osc`,
              power: 5,
              minDecibels: -120,
              maxDecibels: 0,
              smoothingTimeConstant: 0,
            }
          );
        });
        this.nodes.analysers || (this.nodes.analysers = {});
        this.nodes.analysers[id] = { groupAnalysers };
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  _initSongVoices(id: SongId): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const voices: Record<string, AudioPlayerWrapper> = {};
        const promises: Promise<void>[] = [];
        const songEffects = this.nodes.effects![id] as SongEffects;
        // ambient track
        if (this.config[id].ambientTrack) {
          const pathToAudio = getPathToAudio(id, "ambient-track", "vbr");
          const player = new AudioPlayerWrapper(this.audioCtx, pathToAudio!, {
            offlineRendering: true,
            renderLength:
              (this.audioCtx.sampleRate *
                parseInt(this.config[id].ambientTrackLength!) *
                this.config[id].timeSignature *
                60) /
              this.config[id].bpm,
            fade: true,
            fadeLength: this.values.FADE_LENGTH_AMBIENT,
            destination: this.nodes.effects!.premaster,
            loop: true,
          });
          voices["ambient"] = player;
          promises.push(player.init());
        }
        // song voices
        this.config[id].groups.forEach((group) => {
          group.voices.forEach((voice) => {
            const pathToAudio = getPathToAudio(id, voice.name, "vbr");
            const player = new AudioPlayerWrapper(this.audioCtx, pathToAudio!, {
              offlineRendering: true,
              renderLength:
                (this.audioCtx.sampleRate *
                  parseInt(voice.length) *
                  this.config[id].timeSignature *
                  60) /
                this.config[id].bpm,
              fade: true,
              fadeLength: voice.noFade ? 0 : this.values.FADE_LENGTH,
              destination: songEffects.groupNodes[group.name],
              loop: true,
            });
            voices[voice.name] = player;
            promises.push(player.init());
          });
        });
        this.nodes.voices || (this.nodes.voices = {} as NodesVoices);
        this.nodes.voices![id] = voices;
        Promise.all(promises)
          .then(() => resolve())
          .catch((err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * No-arg: returns the full analysers container (including `premaster` and per-song entries).
   * With `songId`: returns only that song's `{ groupAnalysers }` object.
   */
  getAnalysers(): NodesAnalysers;
  getAnalysers(songId: SongId): SongAnalysers;
  getAnalysers(songId: SongId | null = null): NodesAnalysers | SongAnalysers {
    return songId
      ? (this.nodes.analysers![songId] as SongAnalysers)
      : this.nodes.analysers!;
  }

  /**
   * No-arg: returns the full app-level effects object (premaster, filters, reverb nodes, etc.).
   * With `songId`: returns only that song's `{ groupNodes }` object.
   */
  getEffects(): AppEffects;
  getEffects(songId: SongId): SongEffects;
  getEffects(songId: SongId | null = null): AppEffects | SongEffects {
    return songId
      ? (this.nodes.effects![songId] as SongEffects)
      : this.nodes.effects!;
  }

  getValues(): WrapperValues {
    return this.values;
  }

  getVoices(songId: SongId): Record<string, AudioPlayerWrapper> {
    return this.nodes.voices![songId]!;
  }

  getTempoClock(songId: SongId): TempoClock {
    return this.tempoClocks[songId]!;
  }

  /**
   * Apply a playback `rate` (1 = normal, 0.5 = the Time Warp floor) to the song's
   * tempo clock and every one of its voices. With `glideSeconds > 0` the voices
   * ramp linearly to `rate` over that window instead of jumping — the Time Warp
   * knob chains one such call per glide step for a click-free glide.
   *
   * The clock cannot ramp: TempoClock's position math assumes a piecewise-
   * constant rate. Each gliding segment instead holds the midpoint of (previous
   * commanded rate, `rate`) — by the trapezoid rule the clock's beat integral
   * then equals the linear ramp's integral exactly at every segment end; within a
   * segment they diverge by at most (rate delta x glideSeconds / 8): well under
   * a millisecond of musical position. The glide's final settle call (no glide)
   * re-pins clock and audio to the same exact rate.
   */
  setTimeWarpRate(songId: SongId, rate: number, glideSeconds = 0): void {
    const now = this.audioCtx.currentTime;
    const clock = this.getTempoClock(songId);
    const prevTarget = this.timeWarpTargets[songId] ?? clock.currentRate;
    const clockRate = glideSeconds > 0 ? (prevTarget + rate) / 2 : rate;
    this.timeWarpTargets[songId] = rate;
    clock.setRate(clockRate, now);
    const voices = this.getVoices(songId);
    for (const name in voices) {
      voices[name].setPlaybackRate(rate, now, glideSeconds);
    }
    // The rate change moves every pending boundary's wall-clock time; hand the
    // re-resolved time to each requester so its countdown follows the live grid.
    for (const req of this.transportQueue.values()) {
      if (req.clock === clock) {
        req.onRetime?.(clock.timeAt(req.targetBeat));
      }
    }
  }

  /**
   * Queue a voice to start/stop on the next `intervalBeats` boundary, committing
   * the actual `start`/`stop` only once that boundary is within the look-ahead
   * horizon. Committing late means the boundary's wall-clock time is resolved
   * against the live clock — so a Time Warp change mid-glide can't leave a voice
   * scheduled against a stale grid. `key` (the voice name) dedupes and cancels.
   * `onRetime`, when given, fires on every Time Warp change while the request is
   * pending, with the boundary's re-resolved wall-clock time — the toggle
   * countdown animation uses it to finish exactly when the commit lands.
   */
  scheduleAtBoundary(
    key: string,
    player: AudioPlayerWrapper,
    clock: TempoClock,
    intervalBeats: number,
    action: "start" | "stop",
    onCommit: (time: number) => void,
    onRetime?: (time: number) => void
  ): void {
    const targetBeat = clock.nextBoundaryBeat(
      intervalBeats,
      this.audioCtx.currentTime
    );
    this.transportQueue.set(key, {
      player,
      clock,
      targetBeat,
      action,
      onCommit,
      onRetime,
    });
    if (this.transportTick === null) {
      this.armTransportTick();
    }
  }

  /** Drop a pending boundary request (re-toggle before it commits, or unmount). */
  cancelBoundary(key: string): void {
    this.transportQueue.delete(key);
  }

  /**
   * Arm the next transport poll on the audio clock via the Scheduler. Window
   * timers are throttled to >= 1s in background tabs, which would let a boundary
   * slip into the past before the tick observes it (Web Audio then clamps the
   * start to "now" — audibly off-grid). Scheduler events fire off the audio
   * clock (a dummy BufferSource's `onended`) and are immune to that throttling.
   * Each tick re-arms itself only while requests remain pending.
   */
  private armTransportTick(): void {
    this.transportTick = this.scheduler.scheduleOnce(
      this.audioCtx.currentTime + TRANSPORT_TICK,
      () => this.tickTransport()
    ) as number;
  }

  private tickTransport(): void {
    const now = this.audioCtx.currentTime;
    for (const [key, req] of this.transportQueue) {
      const time = req.clock.timeAt(req.targetBeat);
      if (time <= now + TRANSPORT_LOOKAHEAD) {
        if (req.action === "start") {
          req.player.start(time);
        } else {
          req.player.stop(time);
        }
        req.onCommit(time);
        this.transportQueue.delete(key);
      }
    }
    if (this.transportQueue.size > 0) {
      this.armTransportTick();
    } else {
      this.transportTick = null;
    }
  }

  getConfig(songId: SongId): Omit<SongContextValue, "id"> {
    return this.config[songId];
  }

  /**
   * Applies a named effect at position `value` (1-based index into the pre-calculated
   * lookup tables in `this.values`). "lp"/"hp" set filter frequency + Q; "am" sets
   * reverb wet/dry gains such that wet + dry = 1.
   */
  setEffects(name: string, value: number): void {
    switch (name) {
      case "lp": {
        const v = this.values.lp[Math.round(value) - 1];
        this.nodes.effects!.lpFilter.frequency.value = v.f;
        this.nodes.effects!.lpFilter.Q.value = v.q;
        break;
      }
      case "hp": {
        const v = this.values.hp[Math.round(value) - 1];
        this.nodes.effects!.hpFilter.frequency.value = v.f;
        this.nodes.effects!.hpFilter.Q.value = v.q;
        break;
      }
      case "am": {
        const wet = this.values.am[Math.round(value) - 1];
        this.nodes.effects!.reverbWet.gain.value = wet;
        this.nodes.effects!.reverbDry.gain.value = 1 - wet;
        break;
      }
      default:
        break;
    }
  }
}
