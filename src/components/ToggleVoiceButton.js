import React from 'react';
import Tone from 'tone';
import { incrementPlayersLoaded } from '../actions/activeSongActions';
import { connect } from 'react-redux';

class ToggleVoiceButton extends React.Component {

    constructor(props){
        super(props);

        const player = new Tone.Player(`./sounds/${this.props.activeSong.name}/${this.props.fileName}`,  
            () => {
                props.dispatch( incrementPlayersLoaded() );
            }).toMaster();

        player.loop = true;
        player.loopEnd = props.activeSong.length;

        this.state = {
            player
        }
    }

    render() {
        return (
            <div>
                {this.state.player && (
                    <button
                    onClick = {() => {
                        const action = this.state.player.state === 'stopped' ? 'start' : 'stop';
                        switch(action) {
                            case 'start':
                                    this.state.player.start(`@${this.props.quantizeLength}`);
                                    break;
                            case 'stop':
                                    this.state.player.stop(`@${this.props.quantizeLength}`);
                                break;
                        }
                    }}
                    >{this.props.id}</button>
                )}
            </div>
        )
    }
};

const mapStateToProps = (state) => {
    return {
        activeSong: state.activeSong
    };
}

export default connect(mapStateToProps)(ToggleVoiceButton);