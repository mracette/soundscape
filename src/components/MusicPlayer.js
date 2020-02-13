// libs
import React from 'react';

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
import { ApplicationContext } from '../contexts/contexts';

// reducers
import { MusicPlayerReducer } from '../reducers/MusicPlayerReducer';

// other
import { createAudioPlayer } from 'crco-utils';

// styles
import '../styles/components/MusicPlayer.scss';

export const MusicPlayer = () => {

    const { flags } = React.useContext(TestingContext);

    const {
        sampleRate,
        audioCtx,
        premaster,
        scheduler
    } = React.useContext(ApplicationContext);

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
        highpass: 1,
        lowpass: 100,
        ambience: 1
    });

    const audioCtxInitTimeRef = React.useRef(audioCtx.currentTime);
    const randomizeEventRef = React.useRef(null);

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

    }, [state.players])

    /* Ambient Track Hook */
    React.useEffect(() => {

        let ambientPlayer;

        if (flags.playAmbientTrack && ambientTrack) {

            const pathToAudio = require(`../audio/${id}/ambient-track.mp3`);

            createAudioPlayer(audioCtx, pathToAudio, {
                offlineRendering: true,
                renderLength: sampleRate * parseInt(ambientTrackLength) * timeSignature * 60 / bpm,
            }).then((audioPlayer) => {

                ambientPlayer = new AudioPlayerWrapper(audioCtx, audioPlayer, {
                    destination: premaster,
                    loop: true
                });

                ambientPlayer.start(audioCtx.currentTime);

                // should be safe to resume and take the init time here (after user gesture)
                audioCtx.resume();
                audioCtxInitTimeRef.current = audioCtx.currentTime;

            });

        }

        return () => {
            flags.playAmbientTrack && ambientPlayer.stop();
            audioCtx.close();
        };

    }, [bpm, id, flags.playAmbientTrack, ambientTrack, ambientTrackLength, timeSignature, audioCtx, sampleRate, premaster]);

    /* Randomize Hook */
    React.useEffect(() => {
        // init event
        if (state.randomize && !scheduler.repeatingQueue.find((e) => e.id === randomizeEventRef.current)) {
            randomizeEventRef.current = scheduler.scheduleRepeating(
                audioCtx.currentTime + (60 / bpm),
                32 * 60 / bpm,
                triggerRandomVoice
            )
            // update event
        } else if (state.randomize) {
            scheduler.updateCallback(randomizeEventRef.current, triggerRandomVoice);
            // stop event
        } else if (!state.randomize) {
            scheduler.cancel(randomizeEventRef.current);
        }

    }, [bpm, state.randomize, triggerRandomVoice, audioCtx, scheduler])

    /* Mute Hook */
    React.useEffect(() => {

        const startMute = () => {
            premaster.gain.value = 0;
        }

        const stopMute = () => {
            premaster.gain.value = 1;
        }

        if (state.mute) {
            startMute();
        } else {
            stopMute();
        }

    }, [state.mute, premaster])

    return (

        <MusicPlayerContext.Provider value={{
            ...state,
            audioCtxInitTime: audioCtxInitTimeRef.current,
            dispatch
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
                        React.useMemo(() => <ToggleButtonPanel
                            handleReset={handleReset}
                            players={state.players}
                        />, [handleReset, state.players])
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
