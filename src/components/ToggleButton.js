// libs
import React from 'react';
import anime from 'animejs/lib/anime.es.js';

// context
import { MusicPlayerContext } from '../contexts/contexts';
import { SongContext } from '../contexts/contexts';
import { TestingContext } from '../contexts/contexts';
import { LayoutContext } from '../contexts/contexts';

// other
import { createAudioPlayer, nextSubdivision } from '../utils/audioUtils';
import { AudioLooper } from '../classes/AudioLooper';
import { Scheduler } from '../classes/Scheduler';

// styles
import '../styles/components/Icon.scss';
import '../styles/components/ToggleButton.scss';

export const ToggleButton = (props) => {

    const buttonRef = React.useRef();
    const playerRef = React.useRef();
    const animationTargetsRef = React.useRef();
    const schedulerRef = React.useRef();

    const { vh, vw } = React.useContext(LayoutContext);
    const { id, name, timeSignature, bpm } = React.useContext(SongContext);
    const { dispatch, audioCtx, audioCtxInitTime } = React.useContext(MusicPlayerContext);
    const { flags } = React.useContext(TestingContext);

    const [playerState, setPlayerState] = React.useState('stopped');

    const quantizedStartBeats = flags.quantizeSamples ? 4 * timeSignature : 1;
    const buttonRadius = vh ? vh * 3.5 : 0;
    const buttonBorder = vh ? vh * 3.5 / 15 : 0;

    const changePlayerState = (newState) => {

        const initialState = newState === 'active' ? 'pending-start' : 'pending-stop';

        // set local state
        setPlayerState(initialState);

        // update poly count for the group
        props.handleUpdatePlayerOrder(props.name, initialState);

        // dispatch initial update to music player
        dispatch({
            type: 'updatePlayerState',
            payload: {
                id: props.name,
                newState: initialState
            }
        });

        // calculate time till next loop start
        const quantizedStartSeconds = nextSubdivision(
            audioCtx,
            audioCtxInitTime,
            bpm,
            quantizedStartBeats
        );

        // schedule a status change
        schedulerRef.current.scheduleOnce(quantizedStartSeconds).then(() => {

            switch (newState) {
                case 'active': playerRef.current.start(); break;
                case 'stopped': playerRef.current.stop(); break;
            }

            // update local state
            setPlayerState(newState);

            // dispatch final update to music player
            dispatch({
                type: 'updatePlayerState',
                payload: {
                    id: props.name,
                    newState: newState
                }
            });

        });

        // convert to millis for animations
        const quantizedStartMillis = (quantizedStartSeconds - audioCtx.currentTime) * 1000;
        const animationType = newState === 'stopped' ? 'stop' : 'start';
        runAnimation(animationType, quantizedStartMillis);

    }

    const runAnimation = (type, duration) => {

        let strokeDashoffset, points, backgroundColor, rotateZ;

        if (type === 'start') {

            rotateZ = '-180';
            backgroundColor = 'rgba(255, 255, 255, .3)';
            strokeDashoffset = [0, 2 * Math.PI * (buttonRadius - buttonBorder / 2)];
            points = [{ value: "6.69872981 6.69872981 93.01270188 6.69872981 93.01270188 50 93.01270188 93.01270188 6.69872981 93.01270188" }];

        } else if (type === 'stop') {

            rotateZ = '0';
            backgroundColor = 'rgba(255, 255, 255, 0)';
            strokeDashoffset = [animationTargetsRef.current.circleSvg.style.strokeDashoffset, 0];
            points = [{ value: "6.69872981 0 6.69872981 0 93.01270188 50 6.69872981 100 6.69872981 100" }];

        }

        // run cirle animation
        anime({
            targets: animationTargetsRef.current.circleSvg,
            strokeDashoffset,
            duration,
            easing: 'linear'
        });

        // run icon animation
        anime({
            targets: animationTargetsRef.current.iconPoly,
            points,
            duration,
            easing: 'linear'
        });

        // run rotate animation
        anime({
            targets: [animationTargetsRef.current.iconDiv, animationTargetsRef.current.iconDiv.children],
            rotateZ,
            duration,
            easing: 'linear'
        });

        // run button animation
        anime({
            targets: animationTargetsRef.current.button,
            backgroundColor,
            duration,
            easing: 'easeInCubic'
        });

    }

    React.useEffect(() => {

        schedulerRef.current = new Scheduler(audioCtx);
        const pathToAudio = require(`../audio/${id}/${props.name}.mp3`);

        createAudioPlayer(audioCtx, pathToAudio).then((audioPlayer) => {

            // create the player
            playerRef.current = new AudioLooper(audioCtx, audioPlayer.buffer, {
                bpm,
                loopLengthBeats: parseInt(props.length) * timeSignature,
                snapToGrid: true,
                audioCtxInitTime,
                destination: props.groupNode
            });

            // send reference to music player
            dispatch({
                type: 'addPlayer',
                payload: {
                    player: {
                        id: props.name,
                        groupName: props.groupName,
                        buttonRef: buttonRef.current,
                        playerState
                    }
                }
            });

        });

        // store the animation targets based on their relative positions in the DOM
        animationTargetsRef.current = {
            button: buttonRef.current,
            circleSvg: buttonRef.current.children[0],
            iconDiv: buttonRef.current.children[1],
            iconSvg: buttonRef.current.children[1].children[0],
            iconPoly: buttonRef.current.children[1].children[0].children[0],
        }

    }, []);

    React.useEffect(() => {
        if (props.override && (playerState === 'active' || playerState === 'pending-start')) {
            // stop player and remove from the override list
            changePlayerState('stopped');
            props.handleUpdateOverrides(props.name);
        }
    }, [props.override, props.handleUpdateOverrides, props.name, playerState, changePlayerState])

    return (

        <button
            type='button'
            className='toggle-button'
            ref={buttonRef}
            onClick={() => {
                switch (playerState) {
                    case 'stopped': // start if stopped
                        changePlayerState('active');
                        break;
                    case 'active': // stop if active
                        changePlayerState('stopped');
                        break;
                    case 'pending-start': // cancel start if triggered on pending-start
                        changePlayerState('stopped');
                        break;
                    case 'pending-stop': break; // do nothing if triggered on pending-stop
                    default: break;
                }
            }}
            style={{
                height: buttonRadius * 2,
                width: buttonRadius * 2
            }}
        >

            <svg
                className='svg'
                width={2 * buttonRadius}
                height={2 * buttonRadius}
                style={{
                    strokeDashoffset: playerState === 'active' ? 2 * Math.PI * (buttonRadius - buttonBorder / 2) : 0
                }}
            >

                <circle
                    className='svg-circle'
                    cx={buttonRadius}
                    cy={buttonRadius}
                    r={buttonRadius - buttonBorder / 2}
                    style={{
                        strokeWidth: buttonBorder,
                        strokeDasharray: 2 * Math.PI * (buttonRadius - buttonBorder / 2)
                    }}
                />

            </svg>

            <div id='scale-div-morph' className={`icon`}>

                <svg
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    className={`icon icon-white`}
                >

                    <polygon
                        id='icon-play3-poly'
                        className={`icon icon-white`}
                        points="6.69872981 0 46.650635094 25 93.01270188 50 46.650635094 75 6.69872981 100"
                    />

                </svg>

            </div>

        </button>
    );
}
