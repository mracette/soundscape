/* eslint-disable */ 

// libs
import React from 'react';
import anime from 'animejs/lib/anime.es.js';

// context
import { MusicPlayerContext } from '../contexts/MusicPlayerContext';

// other
import { createAudioPlayer, nextSubdivision } from '../utils/audioUtils';
import { AudioLooper } from '../classes/AudioLooper';
import Scheduler from '../classes/Sheduler';

// styles
import '../styles/components/ToggleButton.scss';

class ToggleButton extends React.Component {

    constructor(props) {
        super(props);

        this.buttonRadius = 4;
        this.buttonBorder = this.buttonRadius / 15;
        this.buttonRadiusUnit = 'rem';
        this.buttonRef = React.createRef();

        this.quantizedStartBeats = undefined;

        this.scheduler = undefined;
    
        this.state = {
            player: null,
            playerState: 'stopped',
            svgAnimation: null,
            buttonAnimation: null
        };
        
    }

    componentDidMount() {

        this.quantizedStartBeats = this.props.devMode ? 1 : 4 * this.context.timeSignature;
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
                destination: this.props.premaster
            });

            this.setState(() => ({player}));

        });

        // send a reference to this instance up to the MusicPlayer state
        this.props.handleAddPlayerReference({
            id: this.props.name,
            instance: this,
            groupName: this.props.groupName
        });

    }

    componentDidUpdate() {

        this.props.name === 'rhodes-arps[4]' && console.log(this.state.playerState, this.props.name);

        // check if the player override is active (managed by the parent component)
        if(this.props.override && this.state.playerState === 'active') {
            this.stopPlayer(true, false);
            // remove the player from the override list
            this.props.handleUpdateOverrides(this.props.name);
        } else if (this.props.override && this.state.playerState === 'pending-start') {
            this.pendingStop(true, false);
            // remove the player from the override list
            this.props.handleUpdateOverrides(this.props.name);
        }
    }

    componentWillUnmount() {
        // stop the player
        // this.state.player.dispose();

        // remove the targets from any active animations
        anime.remove(this.buttonRef.current);
        anime.remove(this.buttonRef.current.children[0]);
    }

    startPlayer() {
        
        // increment polyphony
        this.props.handleUpdatePoly(1, this.props.name);

        // set state to pending-start
        this.setState(() => ({playerState: 'pending-start'}));
        
        // find the next quantized subdivision
        const quantizedStartSeconds = nextSubdivision(
            this.props.audioCtx, 
            this.props.audioCtxInitTime,
            this.context.bpm,
            this.quantizedStartBeats
        );

        // convert to millis for animations
        const quantizedStartMillis = (quantizedStartSeconds - this.props.audioCtx.currentTime) * 1000;

        // schedule a start and status change
        this.state.player.start(quantizedStartSeconds);
        this.scheduler.scheduleOnce(quantizedStartSeconds).then(() => {
            console.log('scheduled active');
            this.setState(() => ({playerState: 'active'}));
        });

        const svgAnimation = anime({
            targets: this.buttonRef.current.children[0], //svg
            strokeDashoffset: [0, 2 * Math.PI * (this.buttonRadius - this.buttonBorder / 2) + this.buttonRadiusUnit],
            duration: quantizedStartMillis,
            easing: 'linear'
        });

        const buttonAnimation = anime({
            targets: this.buttonRef.current, // button
            backgroundColor: 'rgba(255,255,255, 0.3)',
            duration: quantizedStartMillis,
            easing: 'easeInCubic'
        });

        this.setState(() => ({
            svgAnimation,
            buttonAnimation
        }));
            
    }

    stopPlayer(override, reset) {
        
            this.setState(() => ({playerState: 'pending-stop'}));

            if(reset) {
                this.props.handleResetPoly();
            } else {
                this.props.handleUpdatePoly(-1, this.props.name);
            }

            const quantizedStartSeconds = nextSubdivision(
                this.props.audioCtx, 
                this.props.audioCtxInitTime,
                this.context.bpm,
                this.quantizedStartBeats
            );
    
            const quantizedStartMillis = (quantizedStartSeconds - this.props.audioCtx.currentTime) * 1000;
            
            this.state.player.stop(quantizedStartSeconds);
            this.scheduler.scheduleOnce(quantizedStartSeconds).then(() => {
                console.log('scheduled stopped (from stop)');
                this.setState(() => ({playerState: 'stopped'}));
            });

            const svgAnimation = anime({
                targets: this.buttonRef.current.children[0], //svg
                strokeDashoffset: [0, 2 * Math.PI * (this.buttonRadius - this.buttonBorder / 2) + this.buttonRadiusUnit],
                duration: quantizedStartMillis,
                easing: 'linear',
                direction: 'reverse'
            });

            const buttonAnimation = anime({
                targets: this.buttonRef.current, // button
                backgroundColor: 'rgba(255, 255, 255, 0)',
                duration: quantizedStartMillis,
                easing: 'easeInCubic'
            });

            this.setState(() => ({
                svgAnimation,
                buttonAnimation
            }));

    }

    pendingStop(override, reset) {

            // cancel previous start events
            this.scheduler.clear();
            this.state.player.stop();

            this.setState(() => ({playerState: 'pending-stop'}));

            if(reset) {
                this.props.handleResetPoly();
            } else {
                this.props.handleUpdatePoly(-1, this.props.name);
            }

            const quantizedStartSeconds = nextSubdivision(
                this.props.audioCtx, 
                this.props.audioCtxInitTime,
                this.context.bpm,
                this.quantizedStartBeats
            );

            this.props.name === 'rhodes-arps[4]' && console.log('pending-stop event',quantizedStartSeconds);


            // reverse the current animations
            this.state.svgAnimation.reverse();
            this.state.buttonAnimation.reverse();

            this.scheduler.scheduleOnce(quantizedStartSeconds).then(() => {
                console.log('scheduled stopped (from pending)');
                this.setState(() => ({playerState: 'stopped'}));
            });

    }

    render() {
        return (
            <button 
                type = 'button'
                className = 'toggle-button'
                ref = { this.buttonRef }
                onClick = { () => {
                    switch(this.state.playerState) {
                        case 'stopped': this.startPlayer(false, false); break; // start if stopped
                        case 'active': this.stopPlayer(false, false); break; // stop if active
                        case 'pending-start': this.pendingStop(); break; // cancel start if triggered on pending-start
                        case 'pending-stop': break; // do nothing if triggered on pending-stop
                        default: break;
                    }
                } }
                style = {{
                    height: this.buttonRadius * 2 + this.buttonRadiusUnit,
                    width: this.buttonRadius * 2 + this.buttonRadiusUnit,
                    marginRight: this.buttonRadius / 4 + this.buttonRadiusUnit
                }}
            >
                <svg 
                    className = 'svg'
                    width = { 2 * this.buttonRadius + this.buttonRadiusUnit }
                    height = { 2 * this.buttonRadius + this.buttonRadiusUnit }
                >
                    <circle 
                        className = 'svg-circle'
                        cx = { this.buttonRadius + this.buttonRadiusUnit }
                        cy = { this.buttonRadius + this.buttonRadiusUnit }
                        r = { this.buttonRadius - this.buttonBorder / 2 + this.buttonRadiusUnit }
                        style = {{
                            strokeWidth: this.buttonBorder + this.buttonRadiusUnit,
                            strokeDasharray: 2 * Math.PI * (this.buttonRadius - this.buttonBorder / 2) + this.buttonRadiusUnit
                        }}
                    >
                    </circle>
                </svg>
            </button>
        );
    }
}

ToggleButton.contextType = MusicPlayerContext;

export default ToggleButton;