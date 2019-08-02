import React from 'react';
import Tone from 'tone';
import ToggleButtonGroup from './ToggleButtonGroup';
import CanvasViz from './CanvasViz';

export default class MusicPlayer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            songConfig: this.props.songConfig,
            name: this.props.songConfig.name,
            bpm: this.props.songConfig.bpm,
            timeSignature: this.props.songConfig.timeSignature,
            transport: undefined,
            context: undefined,
            players: []
        }
        
        const transport = Tone.Transport;
        transport.bpm.value = this.state.bpm;
        transport.timeSignature = this.state.timeSignature;
        transport.start();
        this.state.transport = transport;

        const context = Tone.Context;
        context.latencyHint = 'fastest';
        this.state.context = context;

        this.handleAddPlayer = this.handleAddPlayer.bind(this);

    }

    handleAddPlayer(player) {
        this.setState((prevState) => {
            console.log(prevState);
           return {
               players: prevState.players.concat(player)
           };
        });
    }

    render() {
        return (
            <div>
                <h1>Music Player</h1> 
                <CanvasViz/>
                <div className = 'button-section'>
                    {this.state.songConfig.groups.map((group) => {
                        return <ToggleButtonGroup
                        key = {group.groupName}
                        groupName = {group.groupName}
                        songName = {this.state.name}
                        voices = {group.voices}
                        transport = {this.state.transport}
                        handleAddPlayer = {this.handleAddPlayer}
                        // polyphony
                        />
                    })}
                </div>
            </div>
        );
    }
}