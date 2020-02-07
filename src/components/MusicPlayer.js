// libs
import React from 'react';

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
import { Analyser } from '../classes/Analyser';
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

const SAMPLE_RATE = 44100;

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

    const [premasterAnalyser, setPremasterAnalyser] = React.useState(null);

    const [state, dispatch] = React.useReducer(MusicPlayerReducer, {
        randomize: false,
        mute: false,
        players: [],
        buttons: [],
        analysers: [],
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
    const audioCtx = React.useRef(new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: SAMPLE_RATE,
        latencyHint: 'interactive'
    }));
    const audioCtxInitTime = React.useRef(audioCtx.current.currentTime);
    const schedulerRef = React.useRef(new Scheduler(audioCtx.current));
    const premaster = React.useRef(audioCtx.current.createGain());

    const handleReset = React.useCallback(() => {

        // take the simple route - click the players!
        const activePlayers = state.players.filter((p) => (p.playerState === 'active' || p.playerState === 'pending-start'));
        activePlayers.forEach((p) => p.buttonRef.click());

    }, [state.players]);

    const triggerRandomVoice = React.useCallback(() => {

        const viableOne = state.players.filter((p) => !p.playerState.includes('pending'));
        const randomOne = Math.floor(Math.random() * viableOne.length);
        state.players[randomOne].buttonRef.click();

        // trigger an additional voice when less than 1/2 are active
        if (viableOne.length >= state.players.length) {
            const viableTwo = viableOne.filter((p, i) => i !== randomOne);
            const randomTwo = Math.floor(Math.random() * viableTwo.length);
            state.players[randomTwo].buttonRef.click();
        }

    }, [state.players])

    /* 
        Ambient Track Hook
    */
    React.useEffect(() => {

        const actx = audioCtx.current;
        actx.resume();

        setPremasterAnalyser(
            new Analyser(audioCtx.current, premaster.current, {
                power: 6,
                minDecibels: -120,
                maxDecibels: 0,
                smoothingTimeConstanct: 0.25
            })
        );

        premaster.current.connect(audioCtx.current.destination);

        if (playAmbientTrack && ambientTrack) {

            const pathToAudio = require(`../audio/${id}/ambient-track.mp3`);

            createAudioPlayer(audioCtx.current, pathToAudio, {
                offlineRendering: true,
                renderLength: ambientTrackLength * timeSignature,
            }).then((audioPlayer) => {

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
            actx.close();
        };

    }, [bpm, id, playAmbientTrack, ambientTrack, ambientTrackLength, timeSignature]);

    /* 
        Randomize Hook
    */
    React.useEffect(() => {
        console.log('hook');
        if (state.randomize && !schedulerRef.current.repeatingQueue.find((e) => e.id === randomizeEventRef.current)) {
            console.log('init randomize');
            randomizeEventRef.current = schedulerRef.current.scheduleRepeating(
                audioCtx.current.currentTime + (60 / bpm),
                (60 / bpm) * 32,
                triggerRandomVoice
            )
        } else if (state.randomize) {
            console.log('update of callback');
            schedulerRef.current.updateCallback(schedulerRef.current, triggerRandomVoice);
        } else if (!state.randomize) {
            console.log('stop randomize');
            schedulerRef.current.cancel(randomizeEventRef.current);
        }

    }, [bpm, state.randomize, triggerRandomVoice])

    /* 
        Mute Hook
    */
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
            sampleRate: SAMPLE_RATE,
            audioCtx: audioCtx.current,
            audioCtxInitTime: audioCtxInitTime.current,
            schedulerRef: schedulerRef.current,
            premaster: premaster.current,
            dispatch
        }}>

            {premasterAnalyser &&
                <FreqBands
                    premasterAnalyser={premasterAnalyser}
                />}

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

            <CanvasViz />

        </MusicPlayerContext.Provider>
    );

}
