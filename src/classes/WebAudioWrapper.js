import {
  initGain,
  initHighpass,
  initLowpass,
  effectParams,
  getPathToAudio,
} from "../utils/audioUtils";

import { loadArrayBuffer } from "crco-utils";
import { Analyser } from "./Analyser";
import { Scheduler } from "./Scheduler";
import { AudioPlayerWrapper } from "./AudioPlayerWrapper";

export class WebAudioWrapper {
  constructor(appConfig) {
    const props = {
      config: {},
      nodes: {},
      values: {
        FADE_LENGTH: 0.025,
        FADE_LENGTH_AMBIENT: 0.01,
        NUM_EFFECT_VALUES: 100,
      },
      status: {},
    };

    props.audioCtx = new (window.AudioContext || window.webkitAudioContext)({
      latencyHint: "balanced",
    });

    props.scheduler = new Scheduler(props.audioCtx);

    appConfig.forEach((songConfig) => {
      // move relevant portion of the app config to the classe's "config" property
      props.config[songConfig.id] = {
        ...songConfig.audio,
      };
      // initialize a status for the song's webaudio nodes
      props.status[songConfig.id] = false;
    });

    Object.assign(this, props);
  }

  async initAppState() {
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

  async initSongState(id) {
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

  _initAppEffects() {
    return new Promise((resolve, reject) => {
      const effects = {};

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

      loadArrayBuffer(pathToAudio)
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

  _initAppEffectValues() {
    /*
     * Exponential calculations are involved in finding effects values based off of
     * a linear scale. Here, we pre-calculate a set of discrete effects values to save
     * compute time later.
     */
    const hpValues = [];
    const lpValues = [];
    const amValues = [];

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

  _initAppAnalysers() {
    return new Promise((resolve, reject) => {
      try {
        const analysers = {};
        analysers.premaster = new Analyser(
          this.audioCtx,
          this.nodes.effects.premaster,
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

  _initSongEffects(id) {
    return new Promise((resolve, reject) => {
      try {
        const groupNodes = {};
        this.config[id].groups.forEach((group) => {
          groupNodes[group.name] = initGain(this.audioCtx, 1);
          groupNodes[group.name].connect(this.nodes.effects.effectsChainEntry);
        });
        this.nodes.effects[id] = { groupNodes };
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  _initSongAnalysers(id) {
    return new Promise((resolve, reject) => {
      try {
        const groupAnalysers = {};
        this.config[id].groups.forEach((group) => {
          // one analyser for 3D vizualizations
          groupAnalysers[group.name] = new Analyser(
            this.audioCtx,
            this.nodes.effects[id].groupNodes[group.name],
            {
              id: `${id}-${group.name}-analyser`,
              ...group.analyser,
            }
          );
          // one analyser for oscilloscopes
          groupAnalysers[group.name + "-osc"] = new Analyser(
            this.audioCtx,
            this.nodes.effects[id].groupNodes[group.name],
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

  _initSongVoices(id) {
    return new Promise((resolve, reject) => {
      try {
        const voices = {};
        const promises = [];
        // ambient track
        if (this.config[id].ambientTrack) {
          const pathToAudio = getPathToAudio(id, "ambient-track", "vbr");
          const player = new AudioPlayerWrapper(this.audioCtx, pathToAudio, {
            offlineRendering: true,
            renderLength:
              (this.audioCtx.sampleRate *
                parseInt(this.config[id].ambientTrackLength) *
                this.config[id].timeSignature *
                60) /
              this.config[id].bpm,
            fade: true,
            fadeLength: this.values.FADE_LENGTH_AMBIENT,
            destination: this.nodes.effects.premaster,
            loop: true,
          });
          voices["ambient"] = player;
          promises.push(player.init());
        }
        // song voices
        this.config[id].groups.forEach((group) => {
          group.voices.forEach((voice) => {
            const pathToAudio = getPathToAudio(id, voice.name, "vbr");
            const player = new AudioPlayerWrapper(this.audioCtx, pathToAudio, {
              offlineRendering: true,
              renderLength:
                (this.audioCtx.sampleRate *
                  parseInt(voice.length) *
                  this.config[id].timeSignature *
                  60) /
                this.config[id].bpm,
              fade: true,
              fadeLength: voice.noFade ? 0 : this.values.FADE_LENGTH,
              destination: this.nodes.effects[id].groupNodes[group.name],
              loop: true,
            });
            voices[voice.name] = player;
            promises.push(player.init());
          });
        });
        this.nodes.voices || (this.nodes.voices = {});
        this.nodes.voices[id] = voices;
        Promise.all(promises)
          .then(() => resolve())
          .catch((err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }

  getAnalysers(songId = null) {
    return songId ? this.nodes.analysers[songId] : this.nodes.analysers;
  }

  getEffects(songId = null) {
    return songId ? this.nodes.effects[songId] : this.nodes.effects;
  }

  getValues() {
    return this.values;
  }

  getVoices(songId) {
    return this.nodes.voices[songId];
  }

  getConfig(songId) {
    return this.config[songId];
  }

  setEffects(name, value) {
    switch (name) {
      case "lp": {
        const v = this.values.lp[Math.round(value) - 1];
        this.nodes.effects.lpFilter.frequency.value = v.f;
        this.nodes.effects.lpFilter.Q.value = v.q;
        break;
      }
      case "hp": {
        const v = this.values.hp[Math.round(value) - 1];
        this.nodes.effects.hpFilter.frequency.value = v.f;
        this.nodes.effects.hpFilter.Q.value = v.q;
        break;
      }
      case "am": {
        const wet = this.values.am[Math.round(value) - 1];
        this.nodes.effects.reverbWet.gain.value = wet;
        this.nodes.effects.reverbDry.gain.value = 1 - wet;
        break;
      }
      default:
        break;
    }
  }
}
