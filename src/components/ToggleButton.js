import React from 'react';
import Tone from 'tone';

export default class ToggleButton extends React.Component {

    constructor(props){
        super(props);

        const player = new Tone.Player(`/audio/${props.songName}/${props.fileName}`,  
            () => {
                props.dispatch( incrementPlayersLoaded() );
            }).toMaster();

        player.loop = true;
        player.loopEnd = props.length;

        // let newPlayer = []
        // newPlayer.push({
        //     id: props.id,
        //     player 
        // })

        // props.handleAddPlayer(newPlayer);

        this.state = {
            player,
            playerState: 'stopped'
        }
    }

    render() {
        return (
                <button
                    className = {`${this.state.playerState}-toggle-button toggle-button`}
                    onClick = {() => {
                        const action = this.state.player.state === 'stopped' ? 'start' : 'stop';
                        const quantizedStartAction = `@${this.props.quantizeLength}`;
                        switch(action) {
                            case 'start':
                                this.setState(() => ({playerState: 'pending'}));
                                this.props.transport.schedule(() => {
                                    this.state.player.start();
                                    this.setState(() => ({playerState: 'active'}));
                                }, quantizedStartAction);
                                break;
                            case 'stop':
                                this.setState(() => ({playerState: 'pending'}));
                                this.props.transport.schedule(() => {
                                    this.state.player.stop();
                                    this.setState(() => ({playerState: 'stopped'}));
                                }, quantizedStartAction);
                                break;
                        }
                    }}
                >{this.props.id}</button>
        )
    }
};