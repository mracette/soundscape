import React from 'react';
import ToggleVoiceButtonGroup from './ToggleVoiceButtonGroup';
import AudioManager from './AudioManager';
import { connect } from 'react-redux';
import { loadNewSong } from '../actions/songActions';

class MusicPlayer extends React.Component {
    constructor(props) {
        super(props);
        console.log(props.song);
    }
    render() {
        return (
            <div>
                <h1>Header</h1>
                <h2>{this.props.song.name}</h2>
                <h2>{this.props.song.bpm}</h2>
                <AudioManager />
                {/* <canvas id={'canvas-viz'}></canvas> */}
                {this.props.song.groups.map((group) => {
                    console.log({group: group});
                    return (
                        <ToggleVoiceButtonGroup
                            key = {group.name}
                            id = {group.name}
                            voices = {group.players}
                        />
                    )
                })}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        song: state.songs
    }
}

export default connect(mapStateToProps)(MusicPlayer);