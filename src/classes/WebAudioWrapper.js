import {
  initGain,
  initHighpass,
  initLowpass,
  effectParams,
  getPathToAudio,
} from "../utils/audioUtils";

import { loadArrayBuffer, createAudioPlayer } from "crco-utils";
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
    await this._initAppEffectValues();
    await this._initAppEffects();
    await this._initAppAnalysers();
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

      this.nodes.effects = effects;

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

    this.values.lpValues = lpValues;
    this.values.hpValues = hpValues;
    this.values.amValues = amValues;
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
          groupAnalysers[group.name] = new Analyser(
            this.audioCtx,
            this.nodes.effects[id].groupNodes[group.name],
            {
              id: `${id}-${group.name}-analyser`,
              ...group.analyser,
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
        // ambient track
        if (this.config[id].ambientTrack) {
          const pathToAudio = getPathToAudio(id, "ambient-track", "vbr");
          createAudioPlayer(this.audioCtx, pathToAudio, {
            offlineRendering: true,
            renderLength:
              (this.audioCtx.sampleRate *
                parseInt(this.config[id].ambientTrackLength) *
                this.config[id].timeSignature *
                60) /
              this.config[id].bpm,
            fade: true,
            fadeLength: this.values.FADE_LENGTH_AMBIENT,
          }).then((audioPlayer) => {
            voices["ambient"] = new AudioPlayerWrapper(
              this.audioCtx,
              audioPlayer,
              {
                destination: this.nodes.effects.premaster,
                loop: true,
              }
            );
          });
        }
        // song voices
        this.config[id].groups.forEach((group) => {
          group.voices.forEach((voice) => {
            const pathToAudio = getPathToAudio(id, voice.name, "vbr");
            createAudioPlayer(this.audioCtx, pathToAudio, {
              offlineRendering: true,
              renderLength:
                (this.audioCtx.sampleRate *
                  parseInt(voice.length) *
                  this.config[id].timeSignature *
                  60) /
                this.config[id].bpm,
              fade: true,
              fadeLength: this.values.FADE_LENGTH,
            }).then((audioPlayer) => {
              voices[voice.name] = new AudioPlayerWrapper(
                this.audioCtx,
                audioPlayer,
                {
                  destination: this.nodes.effects[id].groupNodes[group.name],
                  loop: true,
                }
              );
            });
          });
        });
        this.nodes.voices || (this.nodes.voices = {});
        this.nodes.voices[id] = voices;
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  getAnalysers() {
    return this.nodes.analysers;
  }

  getEffects() {
    return this.nodes.effects;
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
}
