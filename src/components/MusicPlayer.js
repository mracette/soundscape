// libs
import React from 'react';

// components
import CanvasViz from './CanvasViz';
import EffectsPanel from './EffectsPanel';
import FreqBands from './FreqBands';
import MenuButtonParent from './MenuButtonParent';
import Metronome from './Metronome';
import SongInfoPanel from './SongInfoPanel';
import ToggleButtonPanel from './ToggleButtonPanel';

// contexts
import { MusicPlayerContext } from '../contexts/MusicPlayerContext';

// other
import Analyser from '../viz/Analyser';
import { createAudioPlayer, nextSubdivision } from '../utils/audioUtils';
import { AudioLooper } from '../classes/AudioLooper';
import Scheduler from '../classes/Sheduler';

// styles
import '../styles/components/MusicPlayer.scss';

class MusicPlayer extends React.Component {

    constructor(props) {
        super(props);
        
        this.devMode = true;
        
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

        this.state = {
            playerReferences: [],
            mute: false,
            randomize: false,
            randomizeEventId: null
        };

        this.handleAddPlayerReference = this.handleAddPlayerReference.bind(this);
        this.handleRandomize = this.handleRandomize.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.handleMute = this.handleMute.bind(this);

    }

    componentDidMount() {
    
        // if song has an ambient track, load it
        if(this.context.ambientTrack) {

            const pathToAudio = require(`../audio/${this.context.id}/ambient-track.mp3`);

            createAudioPlayer(this.audioCtx, pathToAudio).then((audioPlayer) => {

                this.ambientLoopPlayer = new AudioLooper(this.audioCtx, audioPlayer.buffer, {
                    bpm: this.context.bpm,
                    loopLengthBeats: this.ambientTrackLength * this.context.timeSignature,
                    snapToGrid: false,
                    fadeInTime: .00001,
                    fadeOutTime: .00001,
                    audioCtxInitTime: this.audioCtxInitTime,
                    destination: this.premaster
                });

                //this.ambientLoopPlayer.start()

            });

        }

    }

    handleAddPlayerReference(player) {
        this.setState((prevState) => ({playerReferences: [...prevState.playerReferences, player]}));
    }

    // turns off all active players
    handleReset() {
        this.state.playerReferences.map((p) => {
            if(p.instance.state.playerState === 'active') {p.instance.stopPlayer(false, true);}
            if(p.instance.state.playerState === 'pending-start') {p.instance.pendingStop(false, true);}
        })
    }

    handleRandomize() {

        this.setState((prevState) => {

            let randomizeEventId;

            if(! prevState.randomize) {

                randomizeEventId = this.scheduler.scheduleRepeating(
                    this.audioCtx.currentTime + (60 / this.context.bpm), 
                    (60 / this.context.bpm) * 32,
                    () => {

                        const playerMap = this.state.playerReferences.map((p) => p.instance.state.playerState === 'active' ? 1 : 0)
                        const activePlayers = playerMap.reduce((a,b) => a + b);

                        // trigger a random voice
                        const random = Math.floor(Math.random() * this.state.playerReferences.length);
                        const button = this.state.playerReferences[random].instance.buttonRef.current;
                        button.click();

                        // if less than half of the players are active, trigger an additional voice
                        if(activePlayers < this.state.playerReferences.length / 2) {
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
                randomize: ! prevState.randomize,
                randomizeEventId
            }

        });

    }

    handleMute() {

        this.setState((prevState) => {

            if(!prevState.mute) {

                this.premaster.gain.value = 0;

            } else {

                this.premaster.gain.value = 1;
            }

            return {mute: !prevState.mute}

        })

    }

    // cleanup by closing the audio context when the component unmounts
    componentWillUnmount() {
        !!this.ambientLoopPlayer && this.ambientLoopPlayer.stop();
        this.audioCtx.close();
    }

    render() {
        return (
            <div>

                {/* <div className = 'flex-row'> */}
                    {/* <h1 id = 'song-title'>Now Playing: {this.context.name}</h1> */}
                
                    {/* <Metronome /> */}

                    <FreqBands 
                        analyser = {this.premasterAnalyser}
                        bpm = {this.context.bpm}
                        timeSignature = {this.context.timeSignature}
                    />
                    {/* </div> */}

                    <MenuButtonParent 
                        name = 'Menu'
                        direction = 'right'
                        separation = '6rem'
                        parentSize = '5rem'
                        childSize = '3rem'
                        clickToOpen = { true }
                        childButtonProps = { [{
                            autoOpen: true,
                            id: 'toggles',
                            icon: '',
                            content: 
                            <ToggleButtonPanel 
                                devMode = {this.devMode}
                                config = {this.context} 
                                handleReset = {this.handleReset}
                                handleRandomize = {this.handleRandomize}
                                handleMute = {this.handleMute}
                                handleAddPlayerReference = {this.handleAddPlayerReference}
                                audioCtx = {this.audioCtx}
                                audioCtxInitTime = {this.audioCtxInitTime}
                                premaster = {this.premaster}
                                randomize = {this.state.randomize}
                                mute = {this.state.mute}
                            />
                        }, {
                            id: 'effects',
                            icon: '',
                            content: <EffectsPanel/>
                        }, {
                            id: 'song-info',
                            icon: '',
                            content: <SongInfoPanel/>
                        }] }
                    />

                    <CanvasViz />

            </div>
        );
    }
}

MusicPlayer.contextType = MusicPlayerContext;

export default MusicPlayer;
