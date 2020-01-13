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
    const iconRef = React.useRef();
    const svgAnimationRef = React.useRef();
    const buttonAnimationRef = React.useRef();
    const playerRef = React.useRef();

    const { vh, vw } = React.useContext(LayoutContext);
    const { id, name, timeSignature, bpm } = React.useContext(SongContext);
    const { dispatch, audioCtx, audioCtxInitTime } = React.useContext(MusicPlayerContext);
    const { flags } = React.useContext(TestingContext);

    const [playerState, setPlayerState] = React.useState('stopped');

    const quantizedStartBeats = flags.quantizeSamples ? 4 * timeSignature : 1;
    const buttonRadius = vh ? vh * 3.5 : 0;
    const buttonBorder = vh ? vh * 3.5 / 15 : 0;

    React.useEffect(() => {

        const scheduler = new Scheduler(audioCtx);
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
                    id: props.name,
                    instance: this,
                    groupName: props.groupName
                }
            });

        });

    }, []);

    return (

        <button
            type='button'
            className='toggle-button'
            ref={buttonRef}
            onClick={() => {
                // switch (this.state.playerState) {
                //     case 'stopped': this.startPlayer(false, false); break; // start if stopped
                //     case 'active': this.stopPlayer(false, false); break; // stop if active
                //     case 'pending-start': this.pendingStop(); break; // cancel start if triggered on pending-start
                //     case 'pending-stop': break; // do nothing if triggered on pending-stop
                //     default: break;
                // }
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
