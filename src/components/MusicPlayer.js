// libs
import React from 'react';

// components
import CanvasViz from './CanvasViz';
import EffectsPanel from './EffectsPanel';
import FreqBands from './FreqBands';
import MenuButtonParent from './MenuButtonParent';
import Metronome from './Metronome';
import Oscilloscope from './Oscilloscope';
import SongInfoPanel from './SongInfoPanel';
import ToggleButtonPanel from './ToggleButtonPanel';

// contexts
import { MusicPlayerContext } from '../contexts/MusicPlayerContext';

// other
import Analyser from '../viz/Analyser';
import { createAudioPlayer, nextSubdivision } from '../utils/audioUtils';
import { AudioLooper } from '../classes/AudioLooper';

// styles
import '../styles/components/MusicPlayer.scss';

class MusicPlayer extends React.Component {

    constructor(props) {
        super(props);

        this.devMode = false;

        // init new audio context instance
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

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
            smoothingTimeConstanct: 0.85
        });

        this.state = {
            playerReferences: []
        };

        this.handleAddPlayerReference = this.handleAddPlayerReference.bind(this);
        this.handleRandomize = this.handleRandomize.bind(this);
        this.handleReset = this.handleReset.bind(this);

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

                this.ambientLoopPlayer.start()

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

    }

    // cleanup by closing the audio context when the component unmounts
    componentWillUnmount() {
        !!this.ambientLoopPlayer && this.ambientLoopPlayer.stop();
        this.audioCtx.close();
    }

    render() {
        return (
            <div>
                <h3 id = 'song-title'>Now Playing: {this.context.name}</h3>
                
                    {/* <Metronome /> */}

                    <Oscilloscope 
                        analyser = {this.premasterAnalyser}
                    />

                    <FreqBands 
                        analyser = {this.premasterAnalyser}
                    />

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
                            content: <ToggleButtonPanel 
                                devMode = {this.devMode}
                                config = {this.context} 
                                handleReset = {this.handleReset}
                                handleRandomize = {this.handleRandomize}
                                handleAddPlayerReference = {this.handleAddPlayerReference}
                                audioCtx = {this.audioCtx}
                                audioCtxInitTime = {this.audioCtxInitTime}
                                premaster = {this.premaster}
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
