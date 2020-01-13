// libs
import React from 'react';
import anime from 'animejs';

// components
import { CanvasViz } from './CanvasViz';
import { EffectsPanel } from './EffectsPanel';
import { FreqBands } from './FreqBands';
import { MenuButtonParent } from './MenuButtonParent';
import { SongInfoPanel } from './SongInfoPanel';
import { ToggleButtonPanel } from './ToggleButtonPanel';

// context
import { MusicPlayerContext } from '../contexts/contexts';
import { SongContext } from '../contexts/contexts';

// reducers
import { MusicPlayerReducer } from '../reducers/MusicPlayerReducer';

// other
import { Analyser } from '../viz/Analyser';
import { createAudioPlayer } from '../utils/audioUtils';
import { AudioLooper } from '../classes/AudioLooper';
import { solveExpEquation } from '../utils/mathUtils';
import { Scheduler } from '../classes/Scheduler';

// styles
import '../styles/components/MusicPlayer.scss';

// effects chain parameters
const effectParams = {
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

export const MusicPlayer = (props) => {

    const {
        id,
        timeSignature,
        bpm,
        ambientTrack,
        ambientTrackLength
    } = React.useContext(SongContext);

    const [state, dispatch] = React.useReducer(MusicPlayerReducer, {
        randomize: false,
        playerReferences: [],
        groups: [],
        players: [],
        groupEffects: {
            highpass: [],
            lowpass: [],
            reverbDry: [],
            reverbWet: []
        }
    });

    const audioCtx = React.useRef(new (window.AudioContext || window.webkitAudioContext)());
    const audioCtxInitTime = React.useRef(audioCtx.current.currentTime);
    const scheduler = React.useRef(new Scheduler(audioCtx.current));
    const premaster = React.useRef(audioCtx.current.createGain());
    const premasterAnalyser = React.useRef(new Analyser(audioCtx.current, premaster.current, {
        power: 6,
        minDecibels: -120,
        maxDecibels: 0,
        smoothingTimeConstanct: 0.25
    }));

    React.useEffect(() => {

        audioCtx.current.resume();
        premaster.current.connect(audioCtx.current.destination);

        if (ambientTrack) {

            const pathToAudio = require(`../audio/${id}/ambient-track.mp3`);

            createAudioPlayer(audioCtx.current, pathToAudio).then((audioPlayer) => {

                const ambientLoopPlayer = new AudioLooper(audioCtx.current, audioPlayer.buffer, {
                    bpm,
                    loopLengthBeats: ambientTrackLength * timeSignature,
                    snapToGrid: false,
                    fadeInTime: .0000001,
                    fadeOutTime: .0000001,
                    audioCtxInitTime: audioCtxInitTime.current,
                    destination: premaster.current
                });

                // ambientLoopPlayer.start();

            });

        }
    }, [])

    return (
        <MusicPlayerContext.Provider value={{
            ...state,
            audioCtx: audioCtx.current,
            audioCtxInitTime: audioCtxInitTime.current,
            scheduler: scheduler.current,
            premaster: premaster.current,
            premasterAnalyser: premasterAnalyser.current,
            dispatch,
            premasterAnalyser: premasterAnalyser.current
        }}>
            <FreqBands />

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
                        // handleReset={this.handleReset}
                        // handleRandomize={this.handleRandomize}
                        // handleMute={this.handleMute}
                        />
                }, {
                    id: 'effects',
                    iconName: 'icon-equalizer',
                    content:
                        <></>
                    // <EffectsPanel
                    //     impulseResponse={this.state.impulseResponse}
                    //     handleChangeLP={this.handleChangeLP}
                    //     handleChangeHP={this.handleChangeHP}
                    //     handleChangeSpaciousness={this.handleChangeSpaciousness}
                    //     handleEffectsRandomize={this.handleEffectsRandomize}
                    // />
                }, {
                    id: 'song-info',
                    iconName: 'icon-info',
                    content: <SongInfoPanel />
                }]}
            />

            {/* <CanvasViz /> */}

        </MusicPlayerContext.Provider>
    );

}
