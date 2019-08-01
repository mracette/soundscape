import React from 'react';
import Tone from 'tone';
import { loadNewSong } from '../actions/songActions';
import { connect } from 'react-redux';

const defaultConfig = require('./default-config.json');

class AudioManager extends React.Component {
    constructor(props) {
        super(props);

        this.configFile = props.configFile || defaultConfig;

        this.name = this.configFile.name;
        this.bpm = this.configFile.bpm;

        this.transport = Tone.Transport;
        this.transport.timeSignature = this.configFile.timeSignature;
        this.transport.bpm.value = this.configFile.bpm;

        this.context = Tone.context;
        this.context.latencyHint = 'fastest';

        this.groups = [];

        this.playersLoaded = 0;
        this.totalPlayers = 0;
        this.countPlayers();
        this.loadPlayers();
        this.setSongState();

        this.state = {
            name: props.song ? props.song.name : '',
            bpm: props.song ? props.song.bpm : 0,
            players: props.song ? props.song.players: []
        }

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
        this.props.dispatch(
            loadNewSong({
                name: this.name,
                bpm: this.bpm,
                groups: this.groups
            })
        );
        console.log(this.props.song);
    }

    render() {
        return (
            <div className="invisible"></div>
        );
    }
};

const mapStateToProps = (state) => {
    return {
        song: state.songs
    }
}

export default connect(mapStateToProps)(AudioManager);