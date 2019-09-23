/* eslint-disable */ 

// libs
import React from 'react';
import anime from 'animejs/lib/anime.es.js';

// context
import { MusicPlayerContext } from '../contexts/MusicPlayerContext';

// styles
import '../styles/components/ToggleButton.scss';

class ToggleButton extends React.Component {

    constructor(props) {
        super(props);

        this.buttonRadius = 4;
        this.buttonBorder = this.buttonRadius / 15;
        this.buttonRadiusUnit = 'rem';
        this.buttonRef = React.createRef();
    
        this.state = {
            player: null,
            playerState: 'stopped',
            eventId: null,
            svgAnimation: null,
            buttonAnimation: null
        };
        
    }

    componentDidMount() {
        // get dependencies from the music player context
        this.audioContext = this.context.context;
        this.transport = this.context.transport;
        this.devMode = this.context.devMode;

        // initialize the player associated with this button
        const audio = require(`../audio/${this.context.songId}/${this.props.name}.mp3`);
        const player = new this.context.tone.Player(audio);
        player.connect(this.context.premaster);
        player.loop = true;
        player.loopEnd = this.props.length;

        this.setState(() => ({player}));
    }

    componentDidUpdate() {
        // check if the player override is active (managed by the parent component)
        if(this.props.override && this.state.playerState === 'active') {
            this.stopPlayer(true);
        } else if (this.props.override && this.state.playerState === 'pending-start') {
            this.pendingStop(true);
        }
    }

    startPlayer() {

            this.props.handleUpdatePoly(1, this.props.name);
            this.setState(() => ({playerState: 'pending-start'}));

            const quantizedStartTime = this.devMode ? `@4n`: `@${this.props.quantizeLength}`;
            const quantizedStartSeconds = (this.transport.nextSubdivision(quantizedStartTime) - this.audioContext.now()) * 1000;
            
            const startEvent = this.transport.schedule(() => {
                this.state.player.start();
                this.setState(() => ({playerState: 'active'}));
            }, quantizedStartTime);

            const svgAnimation = anime({
                targets: this.buttonRef.current.children[0], //svg
                strokeDashoffset: [0, 2 * Math.PI * (this.buttonRadius - this.buttonBorder / 2) + this.buttonRadiusUnit],
                duration: quantizedStartSeconds,
                easing: 'linear'
            });

            const buttonAnimation = anime({
                targets: this.buttonRef.current, // button
                backgroundColor: 'rgba(255,255,255, 0.3)',
                duration: quantizedStartSeconds,
                easing: 'easeInCubic'
            });

            this.setState(() => ({
                eventId: startEvent,
                svgAnimation,
                buttonAnimation
            }));
            
    }

    stopPlayer(override) {

            this.props.handleUpdatePoly(-1, this.props.name);
            this.setState(() => ({playerState: 'pending-stop'}));

            const quantizedStartTime = this.devMode ? `@4n`: `@${this.props.quantizeLength}`;
            const quantizedStartSeconds = (this.transport.nextSubdivision(quantizedStartTime) - this.audioContext.now()) * 1000;
            
            const stopEvent = this.transport.schedule(() => {
                this.state.player.stop();
                this.setState(() => ({playerState: 'stopped'}));
                // if the event was the result of a polyphony override, remove the player from the override list
                override && this.props.handleUpdateOverrides(this.props.name);
            }, quantizedStartTime);

            const svgAnimation = anime({
                targets: this.buttonRef.current.children[0], //svg
                strokeDashoffset: [0, 2 * Math.PI * (this.buttonRadius - this.buttonBorder / 2) + this.buttonRadiusUnit],
                duration: quantizedStartSeconds,
                easing: 'linear',
                direction: 'reverse'
            });

            const buttonAnimation = anime({
                targets: this.buttonRef.current, // button
                backgroundColor: 'rgba(255, 255, 255, 0)',
                duration: quantizedStartSeconds,
                easing: 'easeInCubic'
            });

            this.setState(() => ({
                eventId: stopEvent,
                svgAnimation,
                buttonAnimation
            }));

    }

    pendingStop(override) {

            this.props.handleUpdatePoly(-1, this.props.name);
            this.setState(() => ({playerState: 'pending-stop'}));

            const quantizedStartTime = this.devMode ? `@4n`: `@${this.props.quantizeLength}`;

            // remove the pending-stop event from the queue
            this.transport.clear(this.state.eventId);

            // reverse the current animations
            this.state.svgAnimation.reverse();
            this.state.buttonAnimation.reverse();

            const pendingStopEvent = this.transport.schedule(() => {
                this.state.player.stop();
                this.setState(() => ({playerState: 'stopped'}));
                // if the event was the result of a polyphony override, remove the player from the override list
                override && this.props.handleUpdateOverrides(this.props.name);
            }, quantizedStartTime);

            this.setState(() => ({eventId: pendingStopEvent}));
    }

    render() {
        return (
            <button 
                type = 'button'
                className = 'toggle-button'
                ref = { this.buttonRef }
                onClick = { () => {
                    switch(this.state.playerState) {
                        case 'stopped': this.startPlayer(); break; // start if stopped
                        case 'active': this.stopPlayer(); break; // stop if active
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
console.log(ToggleButton.contextType);
export default ToggleButton;