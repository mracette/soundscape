import React from 'react';

export default class SongInfo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: props.visible
        };
    }

    render() {
        return (
            <div id = 'song-info-panel' className = 'control-panel-hidden'
                onMouseEnter = {() => {
                    document.getElementById(this.props.arrowId).style.transform = 'rotate(90deg)';
                }}
                onMouseLeave = {() => {
                    document.getElementById(this.props.arrowId).style.transform = this.props.arrowOrientation;
                }}>

                <button id = 'hide-song-info-panel'
                    onClick = {(e) => {
                        e.preventDefault();
                        const panel = document.getElementById('song-info-panel');
                        panel.classList.remove('control-panel-visible');
                        panel.classList.add('control-panel-hidden');
                        document.getElementById(this.props.arrowId).style.transform = this.props.arrowOrientation;
                    }}
                    >
                    &#10005;
                </button>
                <div className = 'song-info'>
                    <h2>Song</h2>
                    <h3>Title:&nbsp;</h3>{this.props.songName.charAt(0).toUpperCase() + this.props.songName.slice(1)}<br/>
                    <h3>BPM:&nbsp;</h3>{this.props.bpm}<br/>
                    <h3>Key Signature:&nbsp;</h3>{this.props.keySignature}<br/>
                    <h3>Time Signature:&nbsp;</h3>{this.props.timeSignature}/4<br/>
                </div>

                {/* <div>
                    <h2>Session Information</h2>
                    <h3>Title: {this.props.songName}</h3>
                    <h3>BPM: {this.props.bpm}</h3>
                    <h3>Key Signature: {this.props.keySignature}</h3>
                    <h3>Time Signature: {this.props.timeSignature}/4</h3>
                </div> */}

                <div className = 'song-info'>
                    <h2>App</h2>
                    <h3>Author:&nbsp;</h3>Mark Racette<br/>
                    <h3>Technologies:&nbsp;</h3>THREE.js, React, Tone.js<br/>
                    <h3>Contact:&nbsp;</h3> 
                        <a href="mailto:markracette@gmail.com">markracette@gmail.com</a> <br/>
                    <h3>Connect:&nbsp;</h3>
                        <a className='social-link' href='https://instagram.com/rgb.ig'>Instagram</a>&nbsp;|&nbsp;
                        <a className='social-link' href='https://twitter.com/markracette'> Twitter</a>&nbsp;|&nbsp;
                        <a className='social-link' href='https://github.com/mracette'> Github</a>
                </div>

            </div>
        )
    }
}
