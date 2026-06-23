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

// appConfig is a heterogeneous JSON structure; each entry's shape varies per song.
// We type the subset that WebAudioWrapper reads directly and use `any` for the rest.
interface VoiceConfig {
  name: string;
  length: string;
  noFade?: boolean;
  [key: string]: unknown;
}

interface GroupConfig {
  name: string;
  voices: VoiceConfig[];
  analyser?: Record<string, unknown>;
  [key: string]: unknown;
}

interface SongAudioConfig {
  bpm: number;
  timeSignature: number;
  ambientTrack?: boolean;
  ambientTrackLength?: string;
  groups: GroupConfig[];
  [key: string]: unknown;
}

interface AppConfigEntry {
  id: string;
  audio: SongAudioConfig;
  [key: string]: unknown;
}

// Effects nodes for the app-level audio chain
interface AppEffects {
  premaster: GainNode;
  effectsChainEntry: GainNode;
  effectsChainExit: GainNode;
  hpFilter: BiquadFilterNode;
  lpFilter: BiquadFilterNode;
  reverbDry: GainNode;
  reverbWet: GainNode;
  reverb: ConvolverNode;
  // per-song group nodes keyed by song id
  [id: string]: unknown;
}

interface SongEffects {
  groupNodes: Record<string, GainNode>;
}

// Shape is dynamic: top-level has 'premaster', then song-id keys
// Typed as any-indexed to allow both known keys and song-id dynamic keys
type NodesEffects = AppEffects;

interface NodesAnalysers {
  premaster?: Analyser;
  [id: string]: Analyser | { groupAnalysers: Record<string, Analyser> } | undefined;
}

interface NodesVoices {
  [id: string]: Record<string, AudioPlayerWrapper>;
}

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

export class WebAudioWrapper {
  config: Record<string, SongAudioConfig>;
  nodes: Partial<WrapperNodes>;
  values: WrapperValues;
  status: Record<string, boolean>;
  audioCtx: AudioContext;
  scheduler: Scheduler;

  constructor(appConfig: AppConfigEntry[]) {
    const props = {
      config: {} as Record<string, SongAudioConfig>,
      nodes: {} as Partial<WrapperNodes>,
      values: {
        FADE_LENGTH: 0.025,
        FADE_LENGTH_AMBIENT: 0.01,
        NUM_EFFECT_VALUES: 100,
      } as WrapperValues,
      status: {} as Record<string, boolean>,
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

  async initSongState(id: string): Promise<boolean> {
    /*
     * These are WebAudio nodes that are specific to the chosen song. They can
     * persist across the session to avoid re-initialization if a user re-visits
     * a page, but they can be lazily loaded.
     */
    if (!this.status[id]) {
      await this._initSongEffects(id);
      await this._initSongAnalysers(id);
      await this._initSongVoices(id);
      this.status[id] = true;
    }
    return true;
  }

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

      // routing
      effects.effectsChainEntry.connect(effects.lpFilter);
      effects.lpFilter.connect(effects.hpFilter);
      effects.hpFilter.connect(effects.reverbDry);
      effects.hpFilter.connect(effects.reverbWet);
      effects.reverbDry.connect(effects.effectsChainExit);
      effects.reverbWet.connect(effects.reverb);
      effects.reverb.connect(effects.effectsChainExit);
      effects.effectsChainExit.connect(effects.premaster);
      effects.premaster.connect(this.audioCtx.destination);

      this.nodes.effects = effects;

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

  _initSongEffects(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const groupNodes: Record<string, GainNode> = {};
        this.config[id].groups.forEach((group) => {
          groupNodes[group.name] = initGain(this.audioCtx, 1);
          groupNodes[group.name].connect(this.nodes.effects!.effectsChainEntry);
        });
        // Song effects stored as dynamic key on the effects object
        (this.nodes.effects as any)[id] = { groupNodes } as SongEffects;
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  _initSongAnalysers(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const groupAnalysers: Record<string, Analyser> = {};
        this.config[id].groups.forEach((group) => {
          const songEffects = (this.nodes.effects as any)[id] as SongEffects;
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

  _initSongVoices(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const voices: Record<string, AudioPlayerWrapper> = {};
        const promises: Promise<void>[] = [];
        const songEffects = (this.nodes.effects as any)[id] as SongEffects;
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

  getAnalysers(songId: string | null = null): NodesAnalysers | unknown {
    return songId ? this.nodes.analysers![songId] : this.nodes.analysers;
  }

  getEffects(songId: string | null = null): unknown {
    return songId ? (this.nodes.effects as any)[songId] : this.nodes.effects;
  }

  getValues(): WrapperValues {
    return this.values;
  }

  getVoices(songId: string): Record<string, AudioPlayerWrapper> {
    return this.nodes.voices![songId];
  }

  getConfig(songId: string): SongAudioConfig {
    return this.config[songId];
  }

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
