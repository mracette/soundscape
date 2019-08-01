import Tone from 'tone';
import { loadNewSong } from '../actions/songs';

const defaultConfig = require('./default-config.json');

export default class AudioManager {
    constructor(configFile = defaultConfig) {

        this.configFile = configFile;

        this.name = configFile.name;

        this.transport = Tone.Transport;
        this.transport.timeSignature = configFile.timeSignature;
        this.transport.bpm.value = configFile.bpm;

        this.context = Tone.context;
        this.context.latencyHint = 'fastest';

        this.groups = [];
        
        this.playersLoaded = 0;
        this.totalPlayers = 0;
        this.countPlayers();

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