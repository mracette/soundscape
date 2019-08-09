import React from 'react';

export default class ToggleButton extends React.Component {

    constructor(props){
        super(props);

        const Tone = props.tone;

        const player = new Tone.Player(`/audio/${props.songName}/${props.id}.mp3`).toMaster();
        player.loop = true;
        player.loopEnd = props.length;

        this.state = {
            player,
            playerState: 'stopped',
            eventId: undefined
        }
    }

    componentDidMount() {
        this.props.handleAddPlayer([{
            id: this.props.id,
            player: this.state.player,
            groupName: this.props.groupName
        }]);
    }

    componentDidUpdate(prevProps, prevState) {
        console.log(prevState);
        console.log(this.state);
    }

    render() {
        return (
                <button
                    className = {`${this.state.playerState}-toggle-button toggle-button`}
                    // className = {`toggle-button`}
                    id = {this.props.id}
                    onClick = {() => {
                        const quantizedStartAction = this.props.devMode ? `@4n`: `@${this.props.quantizeLength}`;
                        switch(this.state.playerState) {
                            case 'stopped':
                            // button starts player and changes state to 'active'
                                this.setState(() => ({playerState: 'pending-start'}));
                                this.props.handleChangeState('started');

                                let startEventId = this.props.transport.schedule(() => {
                                    this.state.player.start();
                                    this.setState(() => ({playerState: 'active'}));
                                }, quantizedStartAction);
                                
                                this.setState(() => ({eventId: startEventId}));

                                break;
                            case 'active': 
                            // button stops player and changes state to 'stopped'
                                this.setState(() => ({playerState: 'pending-stop'}));
                                
                                let stopEventId = this.props.transport.schedule(() => {
                                    this.state.player.stop();
                                    this.setState(() => ({playerState: 'stopped'}));
                                }, quantizedStartAction);

                                this.setState(() => ({eventId: stopEventId}));

                                break;
                            case 'pending-start':
                            // button cancels the pending start and changes state to 'pending-stop'
                            // (schedules 'stop')
                                this.props.transport.clear(this.state.eventId);
                                this.setState(() => ({playerState: 'pending-stop'}));

                                let pendingStopEventId = this.props.transport.schedule(() => {
                                    this.state.player.stop();
                                    this.setState(() => ({playerState: 'stopped'}));
                                }, quantizedStartAction);

                                this.setState(() => ({eventId: pendingStopEventId}));

                                break;
                            case 'pending-stop':
                            // button cancels the pending stop and changes state to 'pending-start'
                            // (schedules 'start')
                                this.props.transport.clear(this.state.eventId);
                                this.setState(() => ({playerState: 'pending-start'}));

                                let pendingStartEventId = this.props.transport.schedule(() => {
                                    this.state.player.start();
                                    this.setState(() => ({playerState: 'active'}));
                                }, quantizedStartAction);

                                this.setState(() => ({eventId: pendingStartEventId}));

                                break;
                        }
                    }}
                >
                {/* {this.props.id} */}
                </button>
        )
    }
};