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
            tone: Tone,
            transport: undefined,
            context: undefined,
            players: [],
            totalPlayerCount: undefined,
            playersLoaded: 0
        }

        this.handleAddPlayer = this.handleAddPlayer.bind(this);

    }

    handleAddPlayer(player) {
        this.setState((prevState) => {
            return {
                players: prevState.players.concat(player),
                playersLoaded: prevState.playersLoaded + 1
            };
        });
    }

    componentDidMount() {

        // find total player count
        let count = 0;
        for(let i = 0; i < this.state.songConfig.groups.length; i++) {
            const group = this.state.songConfig.groups[i];
            count += group.voices.length;
            this.setState(() => {
                return {totalPlayerCount: count};
            })
        }

        // initialize transport
        const transport = Tone.Transport;
        transport.bpm.value = this.state.bpm;
        transport.timeSignature = this.state.timeSignature;
        transport.start();

        this.setState(() => {
            return {transport};
        })

        // initialize context
        const context = Tone.context;
        context.latencyHint = 'fastest';

        this.setState(() => {
            return {context}
        })
    }

    render() {
        return (
            <div>
                <h1>Music Player</h1> 
                <CanvasViz
                    context = {this.state.context}
                    players = {this.state.players}
                    flagPlayersLoaded = {this.state.playersLoaded / this.state.totalPlayerCount === 1}
                    // TODO: players load progress
                />
                <div className = 'button-section'>
                    {this.state.songConfig.groups.map((group) => {
                        return <ToggleButtonGroup

                        songName = {this.state.name}
                        tone = {this.state.tone}
                        transport = {this.state.transport}
                        handleAddPlayer = {this.handleAddPlayer}

                        key = {group.groupName}
                        groupName = {group.groupName}
                        voices = {group.voices}
                        // TODO: polyphony

                        />
                    })}
                </div>
            </div>
        );
    }
}