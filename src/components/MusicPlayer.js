import React from 'react';
import Tone from 'tone';
import ToggleVoiceButtonGroup from './ToggleVoiceButtonGroup';
import { initToneObjects } from '../actions/activeSongActions';
import { connect } from 'react-redux';

// window.Tone = require('tone');

class MusicPlayer extends React.Component {
    constructor(props) {
        super(props);

        const transport = Tone.Transport;

        console.log(props.activeSong.timeSignature);
        console.log(props.activeSong.bpm);

        transport.timeSignature = props.activeSong.timeSignature;
        transport.bpm.value = props.activeSong.bpm;
        transport.start('+0.1');

        const context = Tone.context;
        context.latencyHint = 'fastest';
        
        const state = transport.state;

        let playersLoaded = 0;
        let totalPlayers = this.countPlayers();

        const playersLoadedProgress = playersLoaded / totalPlayers;

        props.dispatch( initToneObjects({transport, context, state, playersLoaded, totalPlayers, playersLoadedProgress}));

    }

    countPlayers() {
        let totalPlayers = 0;
        for(let i = 0; i < this.props.activeSong.groups.length; i++) {
            let e = this.props.activeSong.groups[i];
            totalPlayers += e.voices.length;
        }
        return totalPlayers;
    }

    render() {
        return (
            <div>
                <h2>{this.props.activeSong.name}</h2>
                <h2>{this.props.activeSong.bpm}</h2>
                {this.props.activeSong.groups.map((group) => {
                    return (
                        <ToggleVoiceButtonGroup
                            key = {group.groupName}
                            className = {`${group.groupName}-button-group`}
                            voices = {group.voices}
                        />
                    )
                })}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        activeSong: state.activeSong
    }
}

export default connect(mapStateToProps)(MusicPlayer);