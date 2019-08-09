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
            playerGroups: {},
            totalPlayerCount: undefined,
            playersLoaded: 0,
            musicPlayerState: 'stopped',
            devMode: true
        }

        this.handleAddPlayer = this.handleAddPlayer.bind(this);
        this.handleChangeState = this.handleChangeState.bind(this);
        this.handleAddGroupNode = this.handleAddGroupNode.bind(this);

    }

    handleAddPlayer(player, groupName) {
        this.setState((prevState) => {
            return {
                players: prevState.players.concat(player),
                playersLoaded: prevState.playersLoaded + 1
            };
        });
    }

    handleChangeState(newState) {
        this.setState((prevState) => {
            if(newState === 'started' && prevState.musicPlayerState === 'stopped') {
                return {musicPlayerState: 'started'};
            } else {
                return {musicPlayerState: prevState.musicPlayerState};
            }
        })
    }

    handleAddGroupNode(groupNode, groupName) {
        this.setState((prevState) => {
            const obj = {...prevState.playerGroups};
            obj[groupName] = groupNode;
            return {
                playerGroups: obj
            };
        })
    }

    componentDidMount() {

        // find total player count
        let count = 0;
        let obj = {};
        for(let i = 0; i < this.state.songConfig.groups.length; i++) {
            const group = this.state.songConfig.groups[i];
            count += group.voices.length;
            // populate the playerGroups object with an undefined property for each group
            obj[group.groupName] = undefined;
        }

        this.setState((prevState) => {
            return {
                totalPlayerCount: count,
                playerGroups: obj
            };
        })

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
                <CanvasViz
                    context = {this.state.context}
                    players = {this.state.players}
                    playerGroups = {this.state.playerGroups}
                    handleAddGroupNode = {this.handleAddGroupNode}
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
                        handleChangeState = {this.handleChangeState}
                        musicPlayerState = {this.state.musicPlayerState}
                        devMode = {this.state.devMode}

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