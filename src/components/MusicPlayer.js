// libs
import React from 'react';

// components
import { CanvasViz } from './CanvasViz';
import { EffectsPanel } from './EffectsPanel';
import { FreqBands } from './FreqBands';
import { MenuButtonParent } from './menu-button/MenuButtonParent';
import { SongInfoPanel } from './SongInfoPanel';
import { ToggleButtonPanel } from './toggle-button/ToggleButtonPanel';
import { HomePanel } from './HomePanel';
import { AudioPlayerWrapper } from '../classes/AudioPlayerWrapper';

// context
import { MusicPlayerContext } from '../contexts/contexts';
import { SongContext } from '../contexts/contexts';
import { TestingContext } from '../contexts/contexts';

// reducers
import { MusicPlayerReducer } from '../reducers/MusicPlayerReducer';

// other
import { createAudioPlayer } from 'crco-utils';

// styles
import '../styles/components/MusicPlayer.scss';

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
        audioCtx: props.audioCtx,
        scheduler: props.scheduler,
        premaster: props.premaster,
        isLoading: true,
        randomize: false,
        randomizeEffects: false,
        mute: false,
        players: [],
        analysers: [],
        groups: [],
        highpass: 1,
        lowpass: 100,
        ambience: 1
    });

    const randomizeEventRef = React.useRef(null);

    /* Randomize Callback */
    const handleRandomize = React.useCallback(() => {
        state.players.forEach((p) => Math.random() >= 0.5 && p.buttonRef.click());
    }, [state.players])

    /* Reset Callback */
    const handleReset = React.useCallback(() => {

        // take the simple route - click the players!
        const activePlayers = state.players.filter((p) => (p.playerState === 'active' || p.playerState === 'pending-start'));
        activePlayers.forEach((p) => p.buttonRef.click());

    }, [state.players]);

    /* Background Mode Callback */
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

    }, [state.players]);

    // React.useEffect(() => {
    //     console.log(state.players.map(p => p.buttonRef));
    // }, [state.players])

    /* Ambient Track Hook */
    React.useEffect(() => {

        let ambientPlayer;

        if (flags.playAmbientTrack && ambientTrack) {

            const pathToAudio = require(`../audio/${id}/ambient-track.mp3`);

            createAudioPlayer(state.audioCtx, pathToAudio, {
                logLevel: 'debug',
                offlineRendering: true,
                renderLength: state.sampleRate * parseInt(ambientTrackLength) * timeSignature * 60 / bpm,
            }).then((audioPlayer) => {

                ambientPlayer = new AudioPlayerWrapper(state.audioCtx, audioPlayer, {
                    destination: state.premaster,
                    loop: true
                });

                // should be safe to resume and take the init time here (after user gesture)
                state.audioCtx.resume();
                ambientPlayer.start();

            });

        }

        return () => {
            state.audioCtx.suspend();
            flags.playAmbientTrack && ambientPlayer.stop();
        };

    }, [bpm, id, flags.playAmbientTrack, ambientTrack, ambientTrackLength, timeSignature, state.audioCtx, state.premaster, state.sampleRate]);

    /* Randomize Hook */
    React.useEffect(() => {
        // init event
        if (state.randomize && !state.scheduler.repeatingQueue.find((e) => e.id === randomizeEventRef.current)) {
            randomizeEventRef.current = state.scheduler.scheduleRepeating(
                state.audioCtx.currentTime + (60 / bpm),
                32 * 60 / bpm,
                triggerRandomVoice
            )
            // update event
        } else if (state.randomize) {
            state.scheduler.updateCallback(randomizeEventRef.current, triggerRandomVoice);
            // stop event
        } else if (!state.randomize) {
            state.scheduler.cancel(randomizeEventRef.current);
        }

    }, [bpm, state.randomize, triggerRandomVoice, state.audioCtx, state.scheduler]);

    /* Mute Hook */
    React.useEffect(() => {

        const startMute = () => {
            state.premaster.gain.value = 0;
        }

        const stopMute = () => {
            state.premaster.gain.value = 1;
        }

        if (state.mute) {
            startMute();
        } else {
            stopMute();
        }

    }, [state.mute, state.premaster]);

    return (

        <MusicPlayerContext.Provider value={{
            ...state,
            dispatch
        }}>

            <FreqBands />

            <MenuButtonParent
                name='Menu'
                direction='right'
                separation='6rem'
                parentSize='5rem'
                childButtonProps={[{
                    id: 'home',
                    iconName: 'icon-home',
                    content:
                        React.useMemo(() => <HomePanel />, [])
                }, {
                    autoOpen: true,
                    id: 'toggles',
                    iconName: 'icon-music',
                    content:
                        React.useMemo(() => <ToggleButtonPanel
                            handleRandomize={handleRandomize}
                            handleReset={handleReset}
                            players={state.players}
                        />, [handleRandomize, handleReset, state.players])
                }, {
                    id: 'effects',
                    iconName: 'icon-equalizer',
                    content: React.useMemo(() => <EffectsPanel
                        impulseResponse={state.impulseResponse}
                        dispatch={dispatch}
                    />, [state.impulseResponse, dispatch])
                }, {
                    id: 'song-info',
                    iconName: 'icon-info',
                    content:
                        React.useMemo(() => <SongInfoPanel
                        />, [])
                }]}
            />

            <CanvasViz />

        </MusicPlayerContext.Provider>
    );

}
