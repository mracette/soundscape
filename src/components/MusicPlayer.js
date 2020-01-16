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
import { TestingContext } from '../contexts/contexts';

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
        playAmbientTrack
    } = React.useContext(TestingContext);

    const {
        id,
        timeSignature,
        bpm,
        ambientTrack,
        ambientTrackLength
    } = React.useContext(SongContext);

    const [state, dispatch] = React.useReducer(MusicPlayerReducer, {
        randomize: false,
        mute: false,
        players: [],
        groups: [],
        groupEffects: {
            highpass: [],
            lowpass: [],
            reverbDry: [],
            reverbWet: []
        }
    });

    const randomizeEventRef = React.useRef();
    const ambientPlayerRef = React.useRef();
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

    const handleReset = React.useCallback(() => {

        // take the simple route - click the players!
        const activePlayers = state.players.filter((p) => (p.playerState === 'active' || p.playerState === 'pending-start'));
        activePlayers.forEach((p) => p.buttonRef.click());

    }, [state.players]);

    // React.useEffect(() => {
    //     console.log(state.players.map((p) => p.playerState).join(', '));
    // }, [state.players])

    React.useEffect(() => {

        audioCtx.current.resume();
        premaster.current.connect(audioCtx.current.destination);

        if (playAmbientTrack && ambientTrack) {

            const pathToAudio = require(`../audio/${id}/ambient-track.mp3`);

            createAudioPlayer(audioCtx.current, pathToAudio).then((audioPlayer) => {

                ambientPlayerRef.current = new AudioLooper(audioCtx.current, audioPlayer.buffer, {
                    bpm,
                    loopLengthBeats: ambientTrackLength * timeSignature,
                    snapToGrid: false,
                    fadeInTime: .0000001,
                    fadeOutTime: .0000001,
                    audioCtxInitTime: audioCtxInitTime.current,
                    destination: premaster.current
                });

                ambientPlayerRef.current.start();

            });

        }

        return () => {
            playAmbientTrack && ambientPlayerRef.current.stop();
            audioCtx.current.close();
        };

    }, []);

    // handle randomize state changes
    React.useEffect(() => {

        const startRandomize = () => {

            const triggerRandomVoice = () => {
                const random = Math.floor(Math.random() * state.players.length);
                const button = state.players[random].buttonRef;
                button.click();
            }

            randomizeEventRef.current = scheduler.current.scheduleRepeating(
                audioCtx.current.currentTime + (60 / bpm),
                (60 / bpm) * 32,
                () => {

                    const playerMap = state.players.map((p) => p.playerState === 'active' ? 1 : 0)
                    const activePlayers = playerMap.reduce((a, b) => a + b);

                    // trigger a random voice
                    triggerRandomVoice();

                    // if less than half of the players are active, trigger an additional voice
                    if (activePlayers < state.players.length / 2) {
                        triggerRandomVoice();
                    }

                }
            )

        }

        const stopRandomize = () => {
            scheduler.current.cancel(randomizeEventRef.current);
        }

        if (state.randomize) {
            startRandomize();
        } else {
            stopRandomize();
        }

    }, [state.randomize])

    // handle mute state changes
    React.useEffect(() => {

        const startMute = () => {
            premaster.current.gain.value = 0;
        }

        const stopMute = () => {
            premaster.current.gain.value = 1;
        }

        if (state.mute) {
            startMute();
        } else {
            stopMute();
        }

    }, [state.mute])

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
                    content: <ToggleButtonPanel
                        handleReset={handleReset}
                        players={state.players}
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
