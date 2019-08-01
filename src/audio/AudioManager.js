import Tone from 'tone';
import { loadNewSong } from '../actions/songs';
import { initToneObjects } from '../actions/activeSongActions';

const defaultConfig = require('./default-config.json');

export default class AudioManager {
    constructor(configFile = defaultConfig) {

        this.configFile = configFile;

        this.name = configFile.name;

        const transport = Tone.Transport;
        transport.timeSignature = configFile.timeSignature;
        transport.bpm.value = configFile.bpm;

        const context = Tone.context;
        context.latencyHint = 'fastest';
        
        const state = transport.state;

        let playersLoaded = 0;
        let totalPlayers = 0;
        this.countPlayers();

        const playersLoadedProgress = playersLoaded / totalPlayers;

        props.dispatch( initToneObjects({transport, context, state, playersLoadedProgress}));

    }

    countPlayers() {
        for(let i = 0; i < this.configFile.elements.length; i++) {
            let e = this.configFile.elements[i];
            for(let j = 0; j < e.voices.length; j++) {
                this.totalPlayers ++;
            }
        }
    }

    loadPlayers() {
        return new Promise((resolve, reject) => {
            try{
                for(let i = 0; i < this.configFile.elements.length; i++){
                    let e = this.configFile.elements[i];
                    this.groups.push({
                        "groupName": e.groupName,
                        "polyphony": e.polyphony,
                        "players": []
                    });

                    for(let j = 0; j < e.voices.length; j++) {
                        const v = e.voices[j];
                        const p = new Tone.Player(`./sounds/${this.name}/${v.fileName}`, () => {
                            this.playersLoaded++;
                        });
                        p.loop = true;
                        p.loopEnd = v.loopLength;
                        this.groups[i].players.push({
                            name: v.name,
                            length: v.length,
                            quantizeLength: v.quantizeLength,
                            player: p
                        })
                    }
                }
                resolve();
            } catch(err) {
                reject(err);
            }
        });
    }

    setSongState() {
        loadNewSong({
            name: this.name,
            bpm: this.bpm,
            groups: this.groups
        });
    }
};