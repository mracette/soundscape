// libs
import React from 'react';
import anime from 'animejs/lib/anime.es.js';

// context
import { MusicPlayerContext } from '../contexts/MusicPlayerContext';

// other
import { createAudioPlayer, nextSubdivision } from '../utils/audioUtils';
import { AudioLooper } from '../classes/AudioLooper';
import { Scheduler } from '../classes/Scheduler';

// styles
import '../styles/components/Icon.scss';
import '../styles/components/ToggleButton.scss';

export class ToggleButton extends React.Component {

    constructor(props) {
        super(props);

        this.buttonRef = React.createRef();
        this.quantizedStartBeats = undefined;
        this.scheduler = undefined;

        this.state = {
            player: null,
            playerState: 'stopped',
            iconRef: null,
            svgAnimation: null,
            buttonAnimation: null
        };

    }

    componentDidMount() {

        this.quantizedStartBeats = this.props.flags.quantizeSamples ? 4 * this.context.timeSignature : 1;
        this.scheduler = new Scheduler(this.props.audioCtx);

        // construct the path to the audio file
        const pathToAudio = require(`../audio/${this.context.id}/${this.props.name}.mp3`);

        // initialize the player associated with this button
        createAudioPlayer(this.props.audioCtx, pathToAudio).then((audioPlayer) => {

            const player = new AudioLooper(this.props.audioCtx, audioPlayer.buffer, {
                bpm: this.context.bpm,
                loopLengthBeats: parseInt(this.props.length) * this.context.timeSignature,
                snapToGrid: true,
                audioCtxInitTime: this.props.audioCtxInitTime,
                destination: this.props.groupNode
            });

            this.setState(() => ({ player }));

        });

        // send a reference to this instance up to the MusicPlayer state
        this.props.handleAddPlayerReference({
            id: this.props.name,
            instance: this,
            groupName: this.props.groupName
        });

        // store the animation targets based on their position in the ref
        this.animationTargets = {
            button: this.buttonRef.current,
            circleSvg: this.buttonRef.current.children[0],
            iconDiv: this.buttonRef.current.children[1],
            iconSvg: this.buttonRef.current.children[1].children[0],
            iconPoly: this.buttonRef.current.children[1].children[0].children[0],
        }

    }

    componentDidUpdate() {

        // this.getButtonRadius(this.props.vh) = 3.5 * this.props.vh;
        // this.getButtonBorder(this.props.vh) = this.getButtonRadius(this.props.vh) / 15;

        this.props.name === 'rhodes-arps[4]' && console.log(this.state.playerState, this.props.name);

        // check if the player override is active (managed by the parent component)
        if (this.props.override && this.state.playerState === 'active') {
            this.stopPlayer();
            // remove the player from the override list
            this.props.handleUpdateOverrides(this.props.name);
        } else if (this.props.override && this.state.playerState === 'pending-start') {
            this.pendingStop();
            // remove the player from the override list
            this.props.handleUpdateOverrides(this.props.name);
        }
    }

    componentWillUnmount() {
        // stop the player
        this.state.player.stop();
        this.scheduler.clear();

        // remove the targets from any active animations
        anime.remove(this.buttonRef.current);
        anime.remove(this.buttonRef.current.children[0]);
    }

    startPlayer() {

        // update current state
        this.setState(() => ({ playerState: 'pending-start' }));

        // handle polyphony updates
        this.props.handleUpdatePoly(1, this.props.name);

        // calculate time till next loop start
        const quantizedStartSeconds = nextSubdivision(
            this.props.audioCtx,
            this.props.audioCtxInitTime,
            this.context.bpm,
            this.quantizedStartBeats
        );

        // schedule a start and status change
        this.scheduler.scheduleOnce(quantizedStartSeconds).then(() => {
            this.state.player.start();
            this.setState(() => ({ playerState: 'active' }));
        });

        // convert to millis for animations
        const quantizedStartMillis = (quantizedStartSeconds - this.props.audioCtx.currentTime) * 1000;

        // run new animations
        this.runAnimation('start', quantizedStartMillis);

    }

    stopPlayer(reset) {

        // update current state
        this.setState(() => ({ playerState: 'pending-stop' }));

        // handle polyphony updates
        if (reset) {
            this.props.handleResetPoly();
        } else {
            this.props.handleUpdatePoly(-1, this.props.name);
        }

        // calculate time till next loop start
        const quantizedStartSeconds = nextSubdivision(
            this.props.audioCtx,
            this.props.audioCtxInitTime,
            this.context.bpm,
            this.quantizedStartBeats
        );

        // schedule a stop and status change
        this.scheduler.scheduleOnce(quantizedStartSeconds).then(() => {
            this.state.player.stop();
            this.setState(() => ({ playerState: 'stopped' }));
        });

        // convert to millis for animations
        const quantizedStartMillis = (quantizedStartSeconds - this.props.audioCtx.currentTime) * 1000;

        // run new animations
        this.runAnimation('stop', quantizedStartMillis);

    }

    pendingStop(reset) {

        // cancel previous start events
        this.scheduler.clear();
        this.state.player.stop();

        // update current state
        this.setState(() => ({ playerState: 'pending-stop' }));

        // handle polyphony changes
        if (reset) {
            this.props.handleResetPoly();
        } else {
            this.props.handleUpdatePoly(-1, this.props.name);
        }

        // calculate time till next loop start
        const quantizedStartSeconds = nextSubdivision(
            this.props.audioCtx,
            this.props.audioCtxInitTime,
            this.context.bpm,
            this.quantizedStartBeats
        );

        // schedule status change
        this.scheduler.scheduleOnce(quantizedStartSeconds).then(() => {
            this.setState(() => ({ playerState: 'stopped' }));
        });

        // remove the targets from any active animations
        anime.remove(this.buttonRef.current);
        anime.remove(this.buttonRef.current.children[0]);

        // convert to millis for animation
        const quantizedStartMillis = (quantizedStartSeconds - this.props.audioCtx.currentTime) * 1000;

        // run new animations
        this.runAnimation('stop', quantizedStartMillis);

    }

    runAnimation(type, duration) {

        let strokeDashoffset, points, backgroundColor, rotateZ;

        if (type === 'start') {

            rotateZ = '-180';
            backgroundColor = 'rgba(255, 255, 255, .3)';
            strokeDashoffset = [0, 2 * Math.PI * (this.getButtonRadius(this.props.vh) - this.getButtonBorder(this.props.vh) / 2)];
            points = [{ value: "6.69872981 6.69872981 93.01270188 6.69872981 93.01270188 50 93.01270188 93.01270188 6.69872981 93.01270188" }];

        } else if (type === 'stop') {

            rotateZ = '0';
            backgroundColor = 'rgba(255, 255, 255, 0)';
            strokeDashoffset = [this.buttonRef.current.children[0].style.strokeDashoffset, 0];
            points = [{ value: "6.69872981 0 6.69872981 0 93.01270188 50 6.69872981 100 6.69872981 100" }];

        }

        // run cirle animation
        anime({
            targets: this.animationTargets.circleSvg,
            strokeDashoffset,
            duration,
            easing: 'linear'
        });

        // run icon animation
        anime({
            targets: this.animationTargets.iconPoly,
            points,
            duration,
            easing: 'linear'
        });

        // run rotate animation
        anime({
            targets: [this.animationTargets.iconDiv, this.animationTargets.iconDiv.children],
            rotateZ,
            duration,
            easing: 'linear'
        });

        // run button animation
        anime({
            targets: this.animationTargets.button,
            backgroundColor,
            duration,
            easing: 'easeInCubic'
        });

    }

    getButtonRadius(vh) {
        if (vh) {
            return vh * 3.5;
        } else {
            return 0;
        }
    }

    getButtonBorder(vh) {
        if (vh) {
            return vh * 3.5 / 15;
        } else {
            return 0;
        }
    }

    render() {
        return (

            <button
                type='button'
                className='toggle-button'
                ref={this.buttonRef}
                onClick={() => {
                    switch (this.state.playerState) {
                        case 'stopped': this.startPlayer(false, false); break; // start if stopped
                        case 'active': this.stopPlayer(false, false); break; // stop if active
                        case 'pending-start': this.pendingStop(); break; // cancel start if triggered on pending-start
                        case 'pending-stop': break; // do nothing if triggered on pending-stop
                        default: break;
                    }
                }}
                style={{
                    height: this.getButtonRadius(this.props.vh) * 2,
                    width: this.getButtonRadius(this.props.vh) * 2
                }}
            >

                <svg
                    className='svg'
                    width={2 * this.getButtonRadius(this.props.vh)}
                    height={2 * this.getButtonRadius(this.props.vh)}
                >

                    <circle
                        className='svg-circle'
                        cx={this.getButtonRadius(this.props.vh)}
                        cy={this.getButtonRadius(this.props.vh)}
                        r={this.getButtonRadius(this.props.vh) - this.getButtonBorder(this.props.vh) / 2}
                        style={{
                            strokeWidth: this.getButtonBorder(this.props.vh),
                            strokeDasharray: 2 * Math.PI * (this.getButtonRadius(this.props.vh) - this.getButtonBorder(this.props.vh) / 2)
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
}

ToggleButton.contextType = MusicPlayerContext;