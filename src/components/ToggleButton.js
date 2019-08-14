import React from 'react';
import anime from 'animejs/lib/anime.es.js';

export default class ToggleButton extends React.Component {

    constructor(props){
        super(props);

        this.myRef = React.createRef();

        const Tone = props.tone;

        const player = new Tone.Player(`/audio/${props.songName}/${props.id}.mp3`).toMaster();
        player.loop = true;
        player.loopEnd = props.length;

        this.state = {
            player,
            playerState: 'stopped',
            eventId: undefined,
            currentSVGAnimation: undefined,
            currentButtonAnimation: undefined
        }
    }

    componentDidMount() {
        this.props.handleAddPlayer([{
            id: this.props.id,
            player: this.state.player,
            groupName: this.props.groupName
        }]);
    }

    componentDidUpdate() {
        if(this.props.override === true) {
            this.stopPlayer(true);
            this.props.handleUpdateOverride(this.props.id, false);
        }
    }

    startPlayer() {
        this.props.handleUpdatePolyphony(1, this.props.id);
        this.setState(() => ({playerState: 'pending-start'}));

        const quantizedStartAction = this.props.devMode ? `@4n`: `@${this.props.quantizeLength}`;

        // time until scheduled transport event
        const duration = (this.props.transport.nextSubdivision(quantizedStartAction) - this.props.context.now()) * 1000;

        const currentSVGAnimation = anime({
            targets: this.myRef.current.children[0], //svg
            strokeDashoffset: [0, '12.56vw'],
            duration: duration,
            easing: 'linear'
        });

        const currentButtonAnimation = anime({
            targets: this.myRef.current, // button
            backgroundColor: 'rgba(255,255,255, 0.3)',
            duration: duration,
            easing: 'easeInCubic'
        });

        let startEventId = this.props.transport.schedule(() => {
            this.state.player.start();
            this.setState(() => ({playerState: 'active'}));
        }, quantizedStartAction);
        
        this.setState(() => ({
            eventId: startEventId,
            currentButtonAnimation,
            currentSVGAnimation
        }));
    }

    stopPlayer(override) {
        this.props.handleUpdatePolyphony(override ? 0 : -1, this.props.id);
        this.setState(() => ({playerState: 'pending-stop'}));

        const quantizedStartAction = this.props.devMode ? `@4n`: `@${this.props.quantizeLength}`;

        // time until scheduled transport event
        const duration = (this.props.transport.nextSubdivision(quantizedStartAction) - this.props.context.now()) * 1000;

        const currentSVGAnimation = anime({
            targets: this.myRef.current.children[0], //svg
            strokeDashoffset: [0, '12.56vw'],
            duration: duration,
            direction: 'reverse',
            easing: 'linear'
            });

            const currentButtonAnimation = anime({
            targets: this.myRef.current,
            backgroundColor: 'rgba(0,0,0,0)',
            duration: duration,
            easing: 'easeInCubic'
        });
        
        let stopEventId = this.props.transport.schedule(() => {
            this.state.player.stop();
            this.setState(() => ({playerState: 'stopped'}));
        }, quantizedStartAction);

        this.setState(() => ({
            eventId: stopEventId,
            currentButtonAnimation,
            currentSVGAnimation
        }));
    }

    pendingStart() {
        // button cancels the pending stop and changes state to 'pending-start'
        // (schedules 'start')
        this.props.handleUpdatePolyphony(1, this.props.id);
        this.setState(() => ({playerState: 'pending-start'}));

        const quantizedStartAction = this.props.devMode ? `@4n`: `@${this.props.quantizeLength}`;

        this.props.transport.clear(this.state.eventId);
        this.state.currentSVGAnimation.reverse();
        this.state.currentButtonAnimation.reverse();

        let pendingStartEventId = this.props.transport.schedule(() => {
            this.setState(() => ({playerState: 'active'}));
        }, quantizedStartAction);

        this.setState(() => ({eventId: pendingStartEventId}));
    }
    
    pendingStop() {
        // button cancels the pending start and changes state to 'pending-stop'
        // (schedules 'stop')
        this.props.handleUpdatePolyphony(-1, this.props.id);
        this.setState(() => ({playerState: 'pending-stop'}));

        const quantizedStartAction = this.props.devMode ? `@4n`: `@${this.props.quantizeLength}`;

        this.props.transport.clear(this.state.eventId);
        this.state.currentSVGAnimation.reverse();
        this.state.currentButtonAnimation.reverse();
    
        let pendingStopEventId = this.props.transport.schedule(() => {
            this.state.player.stop();
            this.setState(() => ({playerState: 'stopped'}));
        }, quantizedStartAction);
    
        this.setState(() => ({eventId: pendingStopEventId}));
    }

    render() {
        return (
            <button
                className = {'toggle-button'}
                ref = {this.myRef}
                onClick = {() => {
                    switch(this.state.playerState) {
                        case 'stopped': this.startPlayer(); break;
                        case 'active': this.stopPlayer(); break;
                        case 'pending-start': this.pendingStop(); break;
                        case 'pending-stop': this.pendingStart(); break;
                    }
                }}
            >
                <svg width={"4vw"} height={"4vw"}>
                    <circle 
                        className={'toggle-svg'} r={"1.96vw"} cx={'1.98vw'} cy={'1.98vw'}
                    />
                </svg>
            </button>
        )
    }
};