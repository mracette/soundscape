import React from 'react';
import Tone from 'tone';
import ToggleButtonGroup from './ToggleButtonGroup';
import Sliders from './Sliders';
import CanvasViz from './CanvasViz';
import { solveExpEquation } from '../utils/utils';
import SongInfo from './SongInfo';

export default class MusicPlayer extends React.Component {
    constructor(props) {
        super(props);

        const playerGroupsObj = {};

        // each group needs its own effects chain
        this.props.songConfig.groups.map((group) => {
            
            const lpFilter = new Tone.Filter(20000, "lowpass", -12);
            const hpFilter = new Tone.Filter(20, "highpass", -12);
            const reverb = new Tone.JCReverb(0.1);
            reverb.wet.value = 0;

            const effectsChainEntry = new Tone.Gain();
            const effectsChainExit = new Tone.Gain();

            // link effects together
            effectsChainEntry.connect(lpFilter);
            lpFilter.connect(hpFilter);
            hpFilter.connect(reverb);
            reverb.connect(effectsChainExit);

            playerGroupsObj[group.groupName] = {
                lpFilter,
                hpFilter,
                reverb,
                effectsChainEntry,
                effectsChainExit
            };
        });

        this.ref = React.createRef();

        this.state = {
            songConfig: this.props.songConfig,
            name: this.props.songConfig.name,
            bpm: this.props.songConfig.bpm,
            timeSignature: this.props.songConfig.timeSignature,
            tone: Tone,
            transport: Tone.Transport,
            context: Tone.context,
            players: [],
            playerGroups: playerGroupsObj,
            totalPlayerCount: this.props.songConfig.groups.map((group) => group.voices.length).reduce((a,b) => a+b),
            playersLoaded: 0,
            ambientPlayerLoaded: false,
            muted: false,
            devMode: false
        }

        // initialize transport
        this.state.transport.bpm.value = this.state.bpm;
        this.state.transport.timeSignature = this.state.timeSignature;
        this.state.transport.start();

        // initialize context
        this.state.context.latencyHint = 'fastest';
        this.state.context.lookAhead = 0;

        // if song has an ambient track, load it
        const ambientTrack = require(`../audio/${this.state.name}/ambient-track.mp3`);
        if(this.state.songConfig.ambientTrack) {
            this.ambientPlayer = new this.state.tone.Player(ambientTrack, () => {
                this.setState(() => ({ambientPlayerLoaded: true}));
            });
            this.ambientPlayer.toMaster();
            this.ambientPlayer.loop = true;
        }

        this.effectParams = {
            lpFilter: {
                minFreq: 320,
                maxFreq: 20000,
                minQ: 0.71,
                maxQ: 3,
                expFreqParams: solveExpEquation(1, 320, 100, 20000),
                expQParams: solveExpEquation(1, 0.71, 100, 3)
            },
            hpFilter: {
                minFreq: 20,
                maxFreq: 4500,
                minQ: 0.71,
                maxQ: 1.5,
                expFreqParams: solveExpEquation(1, 20, 100, 6500),
                expQParams: solveExpEquation(1, 0.71, 100, 1.5)
            },
            ambience: {
                minRoomSize: 0.1,
                maxRoomSize: 0.3,
                minWet: 0,
                maxWet: 0.4
            }
        }

        this.handleAddPlayer = this.handleAddPlayer.bind(this);
        this.handleChangeHP = this.handleChangeHP.bind(this);
        this.handleChangeLP = this.handleChangeLP.bind(this);
        this.handleChangeAmbience = this.handleChangeAmbience.bind(this);

    }

    componentDidUpdate() {
        if(!!this.state.context && this.props.userGesture) {
            this.state.context.resume();
        }
        if(!!this.state.context && this.props.userGesture && this.state.ambientPlayerLoaded) {
            this.ambientPlayer.start();
        }
    }

    handleAddPlayer(player) {
        player.player.connect(this.state.playerGroups[player.groupName].effectsChainEntry);
        this.setState((prevState) => {
            return {
                players: prevState.players.concat(player),
                playersLoaded: prevState.playersLoaded + 1
            };
        });
    }

    handleChangeLP(newValue) {
        const freqParams = this.effectParams.lpFilter.expFreqParams;
        const QParams = this.effectParams.lpFilter.expQParams;

        Object.keys(this.state.playerGroups).forEach((group) => {
            this.state.playerGroups[group].lpFilter.frequency.value = freqParams.a * Math.pow(freqParams.b, newValue);
            this.state.playerGroups[group].lpFilter.Q.value = QParams.a * Math.pow(QParams.b, newValue);
        })
    }

    handleChangeHP(newValue) {
        const freqParams = this.effectParams.hpFilter.expFreqParams;
        const QParams = this.effectParams.hpFilter.expQParams;

        Object.keys(this.state.playerGroups).forEach((group) => {
            this.state.playerGroups[group].hpFilter.frequency.value = freqParams.a * Math.pow(freqParams.b, newValue);
            this.state.playerGroups[group].hpFilter.Q.value = QParams.a * Math.pow(QParams.b, newValue);
        })
    }

    handleChangeAmbience(newValue) {
        Object.keys(this.state.playerGroups).forEach((group) => {
            this.state.playerGroups[group].reverb.roomSize.value = this.effectParams.ambience.minRoomSize + (newValue - 1)/100 * this.effectParams.ambience.maxRoomSize;
            this.state.playerGroups[group].reverb.wet.value = this.effectParams.ambience.minWet + (newValue - 1)/100 * this.effectParams.ambience.maxWet;
        })
    }

    render() {
        return (
            <div>
                <CanvasViz
                    context = {this.state.context}
                    effectsChain = {this.state.effectsChain}
                    players = {this.state.players}
                    playerGroups = {this.state.playerGroups}
                    handleAddGroupNode = {this.handleAddGroupNode}
                    flagPlayersLoaded = {this.state.playersLoaded / this.state.totalPlayerCount === 1}
                    // TODO: players load progress
                />
                <div id = 'expand-song-info-container'>
                        <h4 className = 'expand-control-panel'
                        onClick = {(e) => {
                            e.preventDefault();
                            const panel = document.getElementById('song-info-panel');
                            if(panel.classList.contains('control-panel-visible')) {
                                panel.classList.remove('control-panel-visible');
                                panel.classList.add('control-panel-hidden');
                                document.getElementById('expand-song-info-arrow').style.transform = 'rotate(180deg)';
                            } else {
                                panel.classList.add('control-panel-visible');
                                panel.classList.remove('control-panel-hidden');
                                document.getElementById('expand-song-info-arrow').style.transform = 'rotate(90deg)';
                            }
                        }}
                        >
                            information&nbsp;
                        </h4>
                        <h4 className =  'expand-control-panel' id = 'expand-song-info-arrow'> &#10139;</h4>
                </div>
                <SongInfo
                    visible = {true}
                    songName = {this.state.name}
                    bpm = {this.state.bpm}
                    keySignature = {this.state.songConfig.keySignature}
                    timeSignature = {this.state.songConfig.timeSignature}
                    arrowId = 'expand-song-info-arrow'
                    arrowOrientation = 'rotate(180deg)'
                />
                <div id = 'expand-control-panel-container'>
                        <h4 className = 'expand-control-panel' id = 'arrow'> &#10139;</h4>
                        <h4 className = 'expand-control-panel'
                        onClick = {(e) => {
                            e.preventDefault();
                            const panel = document.getElementById('control-panel');
                            if(panel.classList.contains('control-panel-visible')) {
                                document.getElementById('control-panel').classList.remove('control-panel-visible');
                                document.getElementById('control-panel').classList.add('control-panel-hidden');
                                document.getElementById('arrow').style.transform = 'rotate(0deg)';
                            } else {
                                document.getElementById('control-panel').classList.add('control-panel-visible');
                                document.getElementById('control-panel').classList.remove('control-panel-hidden');
                                document.getElementById('arrow').style.transform = 'rotate(90deg)';
                            }
                        }}
                        >
                            &nbsp;control panel
                        </h4>
                </div>
                <div className = 'control-panel control-panel-hidden' id = 'control-panel'
                        onMouseEnter = {() => {
                            document.getElementById('arrow').style.transform = 'rotate(90deg)';
                        }}
                        onMouseLeave = {() => {
                            document.getElementById('arrow').style.transform = 'rotate(0deg)';
                        }}
                    >
                    <button id = 'hide-control-panel'
                        onClick = {(e) => {
                            document.getElementById('control-panel').classList.remove('control-panel-visible');
                            document.getElementById('control-panel').classList.add('control-panel-hidden');
                            document.getElementById('arrow').style.transform = 'rotate(0deg)';
                        }}
                        >
                        &#10005;
                    </button>
                        <h2>Voices</h2>
                            <div className = 'control-panel__section'>
                                <div className = 'control-panel__row'>
                                    <button 
                                        className = 'control-panel__button'
                                        onClick = {() => {
                                            this.state.players.map((player) => {
                                                if(player.ref.state.playerState === 'active') {
                                                    player.ref.stopPlayer();
                                                } else if(player.ref.state.playerState === 'pending-start') {
                                                    player.ref.pendingStop();
                                                }
                                            });
                                        }}
                                        >
                                        Reset
                                    </button>
                                    <button 
                                        className = 'control-panel__button'
                                        onClick = {() => {
                                            if(this.state.muted) {
                                                this.state.tone.Master.mute = false;
                                                this.setState(() => ({muted: false}))
                                            } else {
                                                this.state.tone.Master.mute = true;
                                                this.setState(() => ({muted: true}))
                                            }
                                        }}
                                        >
                                        {this.state.muted ? 'Unmute' : 'Mute'}
                                    </button>
                                </div>
                                <div className = 'control-panel__col'>
                                    {this.state.songConfig.groups.map((group, index) => {
                                        return <ToggleButtonGroup

                                        songName = {this.state.name}
                                        tone = {this.state.tone}
                                        transport = {this.state.transport}
                                        context = {this.state.context}
                                        handleAddPlayer = {this.handleAddPlayer}
                                        devMode = {this.state.devMode}

                                        key = {group.groupName}
                                        groupName = {group.groupName}
                                        voices = {group.voices}
                                        polyphony = {group.polyphony}

                                        index = {index}
                                        total = {this.state.songConfig.groups.length}
                                    />
                                    })}
                                </div>
                            </div>
                        <h2>Effects</h2>
                        <div className = 'control-panel__section'>
                            <div className = 'control-panel__table'>
                            <div className = 'control-panel__row'>
                                <button 
                                    className = 'control-panel__button'
                                    onClick = {() => {
                                        this.handleChangeHP(0);
                                        this.handleChangeLP(100);
                                        this.handleChangeAmbience(0);
                                        document.getElementById('hp-slider').value = 1;
                                        document.getElementById('lp-slider').value = 100;
                                        document.getElementById('ambience-slider').value = 1;
                                    }}
                                    >
                                    Reset
                                </button>
                            </div>
                                <Sliders
                                    handleChangeHP = {this.handleChangeHP}
                                    handleChangeLP = {this.handleChangeLP}
                                    handleChangeAmbience = {this.handleChangeAmbience}
                                    total = {this.state.songConfig.groups.length}
                                />
                            </div>
                        </div>
                    </div>
            </div>
        );
    }
}