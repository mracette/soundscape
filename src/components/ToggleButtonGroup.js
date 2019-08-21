import React from 'react';
import ToggleButton from './ToggleButton';

export default class ToggleButtonGroup extends React.Component {
    constructor(props) {
        super(props);

        this.ref = React.createRef();

        this.state = {
            currentPolyphony: 0,
            overrides: [],
            playerOrder: []
        }

        this.handleUpdatePolyphony = this.handleUpdatePolyphony.bind(this);
        this.handleUpdateOverride = this.handleUpdateOverride.bind(this);
    }

    handleUpdatePolyphony(n, playerId) {
        // override the last player to enter the player list
        if(n === 1 && this.state.currentPolyphony === this.props.polyphony) {
            this.setState((prevState) => ({
                playerOrder: prevState.playerOrder.slice(1).concat([playerId]),
                overrides: prevState.overrides.concat([prevState.playerOrder[0]])
            }));
        } else if (n === 1 && this.state.currentPolyphony < this.props.polyphony) {
            this.setState((prevState) => ({
                playerOrder: prevState.playerOrder.concat([playerId]),
                currentPolyphony: prevState.currentPolyphony + 1
            }));
        } else if (n === 1 && this.props.polyphony === -1) {
            this.setState((prevState) => ({
                playerOrder: prevState.playerOrder.concat([playerId]),
                currentPolyphony: prevState.currentPolyphony + 1
            }));
        } else if (n === -1) {
            this.setState((prevState) => ({
                playerOrder: prevState.playerOrder.filter((e) => (e !== playerId)),
                currentPolyphony: prevState.currentPolyphony + -1
            }));
        } else if (n === 0) {
            this.setState((prevState) => ({
                playerOrder: prevState.playerOrder.filter((e) => (e !== playerId))
            }));
    }}

    handleUpdateOverride(playerId, newStatus) {
        this.setState((prevState) => {
            if(newStatus === true) {
                return {overrides: prevState.overrides.concat([playerId])};
            } else if(newStatus === false) {
                return {overrides: prevState.overrides.filter((e) => (e !== playerId))}
            }
        })
    }

    render() {
        return (
            <div>
                <h3>
                    {this.props.groupName} ({this.state.currentPolyphony}/{this.props.polyphony === -1 ? this.props.voices.length : this.props.polyphony})
                </h3>
                <div className={'control-panel__row'}>
                {this.props.voices.map((voice) => {
                    return (
                        <ToggleButton
                        
                        key = {voice.name}
                        id = {voice.name}
                        fileName = {voice.fileName}
                        length = {voice.length}
                        quantizeLength = {voice.quantizeLength}

                        override = {this.state.overrides.indexOf(voice.name) === -1 ? false : true}
                        ref = {this.ref}

                        groupName = {this.props.groupName}
                        songName = {this.props.songName}
                        tone = {this.props.tone}
                        context = {this.props.context}
                        transport = {this.props.transport}
                        handleAddPlayer = {this.props.handleAddPlayer}
                        handleChangeState = {this.props.handleChangeState}
                        handleUpdatePolyphony = {this.handleUpdatePolyphony}
                        handleUpdateOverride = {this.handleUpdateOverride}
                        devMode = {this.props.devMode}
                        
                        />
                        )
                    })}
                </div>
            </div>
        )
    }
};