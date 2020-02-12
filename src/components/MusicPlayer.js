// libs
import React from 'react';
// import anime from 'animejs';

// components
import { CanvasViz } from './CanvasViz';
import { EffectsPanel } from './EffectsPanel';
import { FreqBands } from './FreqBands';
import { MenuButtonParent } from './MenuButtonParent';
import { SongInfoPanel } from './SongInfoPanel';
import { ToggleButtonPanel } from './toggle-button/ToggleButtonPanel';
import { AudioPlayerWrapper } from '../classes/AudioPlayerWrapper';

// context
import { MusicPlayerContext } from '../contexts/contexts';
import { SongContext } from '../contexts/contexts';
import { TestingContext } from '../contexts/contexts';

// reducers
import { MusicPlayerReducer } from '../reducers/MusicPlayerReducer';

// other
import { Analyser } from '../classes/Analyser';
import { createAudioPlayer } from 'crco-utils';
import { solveExpEquation } from '../utils/mathUtils';
import { Scheduler } from '../classes/Scheduler';

// styles
import '../styles/components/MusicPlayer.scss';

import { useTraceUpdate } from '../hooks/useTraceUpdate';

const SAMPLE_RATE = 44100;

export const MusicPlayer = (props) => {

    const { flags } = React.useContext(TestingContext);

    const {
        id,
        timeSignature,
        bpm,
        ambientTrack,
        ambientTrackLength
    } = React.useContext(SongContext);

    const [state, dispatch] = React.useReducer(MusicPlayerReducer, {
        isLoading: true,
        randomize: false,
        randomizeEffects: false,
        mute: false,
        players: [],
        analysers: [],
        groups: [],
        // groupEffects: {
        //     highpass: [],
        //     lowpass: [],
        //     reverbDry: [],
        //     reverbWet: []
        // },
        effectValues: {
            highpass: 1,
            lowpass: 100,
            ambience: 1
        }
    });

    useTraceUpdate(state);

    const audioCtxRef = React.useRef(new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: SAMPLE_RATE,
        latencyHint: 'interactive'
    }));
    const audioCtxInitTimeRef = React.useRef(audioCtxRef.current.currentTime);
    const schedulerRef = React.useRef(new Scheduler(audioCtxRef.current));
    const premasterRef = React.useRef(audioCtxRef.current.createGain());
    const randomizeEventRef = React.useRef(null);

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

        const currentAudioContext = audioCtxRef.current
        let ambientPlayer;

        // should be safe to resume ctx here (after use gesture)
        currentAudioContext.resume();

        if (flags.playAmbientTrack && ambientTrack) {

            const pathToAudio = require(`../audio/${id}/ambient-track.mp3`);

            createAudioPlayer(audioCtxRef.current, pathToAudio, {
                offlineRendering: true,
                renderLength: SAMPLE_RATE * parseInt(ambientTrackLength) * timeSignature * 60 / bpm,
            }).then((audioPlayer) => {

                ambientPlayer = new AudioPlayerWrapper(audioCtxRef.current, audioPlayer, {
                    // destination: premaster.current,
                    destination: audioCtxRef.destination,
                    loop: true
                });

                ambientPlayer.start(audioCtxRef.current.currentTime);

                // should be safe to take the init time here
                audioCtxInitTimeRef.current = audioCtxRef.current.currentTime;

            });

        }

        return () => {
            flags.playAmbientTrack && ambientPlayer.current.stop();
            currentAudioContext.close();
        };

    }, [bpm, id, flags.playAmbientTrack, ambientTrack, ambientTrackLength, timeSignature]);

    /* 
        Randomize Hook
    */
    React.useEffect(() => {
        // init event
        if (state.randomize && !schedulerRef.current.repeatingQueue.find((e) => e.id === randomizeEventRef.current)) {
            randomizeEventRef.current = schedulerRef.current.scheduleRepeating(
                audioCtxRef.current.currentTime + (60 / bpm),
                32 * 60 / bpm,
                triggerRandomVoice
            )
            // update event
        } else if (state.randomize) {
            schedulerRef.current.updateCallback(randomizeEventRef.current, triggerRandomVoice);
            // stop event
        } else if (!state.randomize) {
            schedulerRef.current.cancel(randomizeEventRef.current);
        }

    }, [bpm, state.randomize, triggerRandomVoice])

    /* 
        Mute Hook
    */
    React.useEffect(() => {

        const startMute = () => {
            premasterRef.current.gain.value = 0;
        }

        const stopMute = () => {
            premasterRef.current.gain.value = 1;
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
            audioCtx: audioCtxRef.current,
            audioCtxInitTime: audioCtxInitTimeRef.current,
            schedulerRef: schedulerRef.current,
            premaster: premasterRef.current,
            dispatch
        }}>

            {/* {!state.isLoading && premasterAnalyser &&
                <FreqBands
                    premasterAnalyser={premasterAnalyser}
                />} */}

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
                        <EffectsPanel
                            impulseResponse={state.impulseResponse}
                            dispatch={dispatch}
                        />
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
