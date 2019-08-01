import React from 'react';
import { Link }  from 'react-router-dom';
import { connect } from 'react-redux';
import { loadSongList } from '../actions/songsActions';
import { loadNewSong } from '../actions/activeSongActions';
import MusicPlayer from './MusicPlayer';

class NavigationPanel extends React.Component {

    constructor(props) {
        super(props);
        this.loadSongList();
    }

    loadSongList() {
        this.props.dispatch( loadSongList(require('./songs-meta-data.json')) );
    }

    loadNewSong(name, bpm, timeSignature, groups) {
        this.props.dispatch( loadNewSong({name, bpm, timeSignature, groups}) );
    }

    render() {
        return (
            <div>
                {this.props.activeSong.name !== '' && (
                    <MusicPlayer />
                )}
                {
                    this.props.activeSong.name === '' && this.props.songs.songsMetaData.map((song) => {
                        return (
                            <button
                                key={song.name}
                                onClick = {() => {
                                    this.loadNewSong(song.name, song.bpm, song.timeSignature, song.groups)
                                }}
                            >
                                {song.name}
                            </button>
                        );
                    })
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        songs: state.songs,
        activeSong: state.activeSong
    };
}

export default connect(mapStateToProps)(NavigationPanel);