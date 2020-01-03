/* eslint-disable */

// libs
import React from 'react';
import anime from 'animejs';

// components
import CanvasViz from './CanvasViz';
import EffectsPanel from './EffectsPanel';
import FreqBands from './FreqBands';
import MenuButtonParent from './MenuButtonParent';
import SongInfoPanel from './SongInfoPanel';
import ToggleButtonPanel from './ToggleButtonPanel';

// other
import Analyser from '../viz/Analyser';
import { createAudioPlayer } from '../utils/audioUtils';
import { AudioLooper } from '../classes/AudioLooper';
import Scheduler from '../classes/Sheduler';
import { solveExpEquation } from '../utils/mathUtils';

// styles
import '../styles/components/MusicPlayer.scss';

class MusicPlayer extends React.Component {

    constructor(props) {
        super(props);

        this.devMode = false;
        this.showVisuals = false;

        // init new audio context instance
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // init scheduler
        this.scheduler = new Scheduler(this.audioCtx);

        // get the context time and resume it
        this.audioCtx.resume();
        this.audioCtxInitTime = this.audioCtx.currentTime;

        // init premaster node
        this.premaster = this.audioCtx.createGain();
        this.premaster.connect(this.audioCtx.destination);

        // init premaster analyser to power music player widgets
        this.premasterAnalyser = new Analyser(this.audioCtx, this.premaster, {
            power: 6,
            minDecibels: -120,
            maxDecibels: 0,
            smoothingTimeConstanct: 0.25
        });

        // init effects chain parameters
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
                expFreqParams: solveExpEquation(1, 20, 100, 4500),
                expQParams: solveExpEquation(1, 0.71, 100, 1.5)
            },
            ambience: {
                minRoomSize: 0.1,
                maxRoomSize: 0.3,
                minWet: 0,
                maxWet: 0.4
            }
        }

        this.state = {
            playerReferences: [],
            groupEffects: {
                hpFilters: [],
                lpFilters: [],
                reverbDry: [],
                reverbWet: []
            },
            impulseResponse: null,
            mute: false,
            randomize: false,
            effectsRandomize: false,
            randomizeEventId: null
        };

        // bind handlers
        this.handleAddPlayerReference = this.handleAddPlayerReference.bind(this);
        this.handleRandomize = this.handleRandomize.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.handleMute = this.handleMute.bind(this);
        this.handleAddEffect = this.handleAddEffect.bind(this);
        this.handleEffectsRandomize = this.handleEffectsRandomize.bind(this);
        this.handleChangeLP = this.handleChangeLP.bind(this);
        this.handleChangeHP = this.handleChangeHP.bind(this);
        this.handleChangeSpaciousness = this.handleChangeSpaciousness.bind(this);

    }

    componentDidMount() {

        // if song has an ambient track, load it
        if (this.props.musicPlayerContext.ambientTrack) {

            const pathToAudio = require(`../audio/${this.props.musicPlayerContext.id}/ambient-track.mp3`);

            createAudioPlayer(this.audioCtx, pathToAudio).then((audioPlayer) => {

                this.ambientLoopPlayer = new AudioLooper(this.audioCtx, audioPlayer.buffer, {
                    bpm: this.props.musicPlayerContext.bpm,
                    loopLengthBeats: this.ambientTrackLength * this.props.musicPlayerContext.timeSignature,
                    snapToGrid: false,
                    fadeInTime: .00001,
                    fadeOutTime: .00001,
                    audioCtxInitTime: this.audioCtxInitTime,
                    destination: this.premaster
                });

                this.ambientLoopPlayer.start()

            });

        }

    }

    handleAddPlayerReference(player) {
        this.setState((prevState) => ({ playerReferences: [...prevState.playerReferences, player] }));
    }

    handleReset() {
        // turns off all active players
        this.state.playerReferences.map((p) => {
            if (p.instance.state.playerState === 'active') { p.instance.stopPlayer(false, true); }
            if (p.instance.state.playerState === 'pending-start') { p.instance.pendingStop(false, true); }
        })
    }

    handleRandomize() {

        this.setState((prevState) => {

            let randomizeEventId;

            if (!prevState.randomize) {

                randomizeEventId = this.scheduler.scheduleRepeating(
                    this.audioCtx.currentTime + (60 / this.props.musicPlayerContext.bpm),
                    (60 / this.props.musicPlayerContext.bpm) * 32,
                    () => {

                        const playerMap = this.state.playerReferences.map((p) => p.instance.state.playerState === 'active' ? 1 : 0)
                        const activePlayers = playerMap.reduce((a, b) => a + b);

                        // trigger a random voice
                        const random = Math.floor(Math.random() * this.state.playerReferences.length);
                        const button = this.state.playerReferences[random].instance.buttonRef.current;
                        button.click();

                        // if less than half of the players are active, trigger an additional voice
                        if (activePlayers < this.state.playerReferences.length / 2) {
                            const random = Math.floor(Math.random() * this.state.playerReferences.length);
                            const button = this.state.playerReferences[random].instance.buttonRef.current;
                            button.click();
                        }

                    }
                )

            } else {

                this.scheduler.cancel(this.state.randomizeEventId);
                randomizeEventId = null;

            }

            return {
                randomize: !prevState.randomize,
                randomizeEventId
            };

        });

    }

    handleEffectsRandomize() {

        this.setState((prevState) => {

            let effectsRandomizeEventId;

            if (!prevState.effectsRandomize) {

                const duration = (60 / this.props.musicPlayerContext.bpm) * 8;

                effectsRandomizeEventId = this.scheduler.scheduleRepeating(
                    this.audioCtx.currentTime + (60 / this.props.musicPlayerContext.bpm),
                    duration,
                    () => {

                        anime.remove('hp-slider', 'lp-slider', 'spaciousness-slider');

                        let increments = [
                            {
                                element: document.getElementById('hp-slider'),
                                increment: 0.5 - Math.random()
                            },
                            {
                                element: document.getElementById('lp-slider'),
                                increment: 0.5 - Math.random()
                            },
                            {
                                element: document.getElementById('spaciousness-slider'),
                                increment: 0.5 - Math.random()
                            }
                        ];

                        for (let i = 0; i < increments.length; i++) {

                            const d = increments[i];

                            const initialValue = parseInt(d.element.value);
                            const maxInc = 25;
                            let adjIncrement;

                            const adjNeeded =
                                (initialValue + d.increment * maxInc) < 1 ||
                                (initialValue + d.increment * maxInc) > 100;

                            if (adjNeeded) {
                                adjIncrement = maxInc * (d.increment * -1);
                            } else {
                                adjIncrement = maxInc * d.increment;
                            }

                            anime({
                                targets: d.element,
                                duration: duration * 1000,
                                easing: 'linear',
                                update: (anim) => {
                                    // lerp new value
                                    const newValue = initialValue + (adjIncrement * anim.progress / 100);

                                    // update the slider
                                    d.element.value = newValue;

                                    // update the nodes
                                    switch (d.element.id) {
                                        case 'hp-slider': this.handleChangeHP(newValue); return;
                                        case 'lp-slider': this.handleChangeLP(newValue); return;
                                        case 'spaciousness-slider': this.handleChangeSpaciousness(newValue); return;
                                    }
                                }
                            });

                        }

                    });

            } else {

                // cancel repeat scheduling
                this.scheduler.cancel(this.state.effectsRandomizeEventId);
                effectsRandomizeEventId = null;

                // remove animations
                anime.remove(['hp-slider', 'lp-slider', 'spaciousness-slider']);

            }

            return {
                effectsRandomize: !prevState.effectsRandomize,
                effectsRandomizeEventId
            };

        })

    }

    handleMute() {

        this.setState((prevState) => {

            if (!prevState.mute) {

                this.premaster.gain.value = 0;

            } else {

                this.premaster.gain.value = 1;
            }

            return { mute: !prevState.mute }

        })

    }

    handleAddEffect(effect, type) {
        switch (type) {
            case 'lowpass':
                this.setState((prevState) => {
                    return {
                        groupEffects: {
                            ...prevState.groupEffects,
                            lpFilters: prevState.groupEffects.lpFilters.concat(effect)
                        }
                    }
                });
                return;
            case 'highpass':
                this.setState((prevState) => {
                    return {
                        groupEffects: {
                            ...prevState.groupEffects,
                            hpFilters: prevState.groupEffects.hpFilters.concat(effect),
                        }
                    }
                });
                return;
            case 'reverb-dry':
                this.setState((prevState) => {
                    return {
                        groupEffects: {
                            ...prevState.groupEffects,
                            reverbDry: prevState.groupEffects.reverbDry.concat(effect),
                        }
                    }
                });
                return;
            case 'reverb-wet':
                this.setState((prevState) => {
                    return {
                        groupEffects: {
                            ...prevState.groupEffects,
                            reverbWet: prevState.groupEffects.reverbWet.concat(effect),
                        }
                    }
                });
                return;
        }
    }

    handleChangeLP(newValue) {
        const freqParams = this.effectParams.lpFilter.expFreqParams;
        const QParams = this.effectParams.lpFilter.expQParams;

        this.state.groupEffects.lpFilters.map((filter) => {
            filter.frequency.value = freqParams.a * Math.pow(freqParams.b, newValue);
            filter.Q.value = QParams.a * Math.pow(QParams.b, newValue);
        });

    }

    handleChangeHP(newValue) {
        const freqParams = this.effectParams.hpFilter.expFreqParams;
        const QParams = this.effectParams.hpFilter.expQParams;

        this.state.groupEffects.hpFilters.map((filter) => {
            filter.frequency.value = freqParams.a * Math.pow(freqParams.b, newValue);
            filter.Q.value = QParams.a * Math.pow(QParams.b, newValue);
        });
    }

    handleChangeSpaciousness(newValue) {

        const maxValue = 0.75;

        this.state.groupEffects.reverbDry.map((rd) => {
            rd.gain.value = (1 - maxValue) + maxValue * (100 - newValue) / 99;
        });

        this.state.groupEffects.reverbWet.map((rw) => {
            rw.gain.value = maxValue * (newValue - 1) / 99;
        });
    }

    componentWillUnmount() {
        // cleanup by closing the audio context when the component unmounts
        !!this.ambientLoopPlayer && this.ambientLoopPlayer.stop();
        this.audioCtx.close();
    }

    render() {
        return (
            <>

                {/* <div className = 'flex-row'> */}
                {/* <h1 id = 'song-title'>Now Playing: {this.context.name}</h1> */}

                {/* <Metronome /> */}

                <FreqBands
                    analyser={this.premasterAnalyser}
                    bpm={this.props.musicPlayerContext.bpm}
                    timeSignature={this.props.musicPlayerContext.timeSignature}
                />
                {/* </div> */}

                <MenuButtonParent
                    name='Menu'
                    direction='right'
                    separation='6rem'
                    parentSize='5rem'
                    clickToOpen={true}
                    childButtonProps={[{
                        autoOpen: true,
                        id: 'toggles',
                        iconName: 'icon-music',
                        content:
                            <ToggleButtonPanel
                                devMode={this.devMode}
                                config={this.context}
                                effectsChainEntry={this.effectsChainEntry}
                                effectsChainExit={this.effectsChainExit}
                                handleReset={this.handleReset}
                                handleRandomize={this.handleRandomize}
                                handleMute={this.handleMute}
                                handleAddPlayerReference={this.handleAddPlayerReference}
                                handleAddEffect={this.handleAddEffect}
                                audioCtx={this.audioCtx}
                                audioCtxInitTime={this.audioCtxInitTime}
                                premaster={this.premaster}
                                randomize={this.state.randomize}
                                mute={this.state.mute}
                            />
                    }, {
                        id: 'effects',
                        iconName: 'icon-equalizer',
                        content:
                            <EffectsPanel
                                impulseResponse={this.state.impulseResponse}
                                handleChangeLP={this.handleChangeLP}
                                handleChangeHP={this.handleChangeHP}
                                handleChangeSpaciousness={this.handleChangeSpaciousness}
                                handleEffectsRandomize={this.handleEffectsRandomize}
                            />
                    }, {
                        id: 'song-info',
                        iconName: 'icon-info',
                        content: <SongInfoPanel />
                    }]}
                />

                <CanvasViz />

            </>
        );
    }
}

export default MusicPlayer;
