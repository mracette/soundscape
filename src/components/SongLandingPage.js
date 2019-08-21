import React from 'react';

export default class SongLandingPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            renderFlag: !props.userGesture
        }
    }

    componentDidUpdate(prevProps) {
        if(!prevProps.userGesture && this.props.userGesture) {
            const updateTime = 750;
            document.getElementById('song-landing-page').style.transitionDuration = `${updateTime}ms`;
            document.getElementById('song-landing-page').style.opacity = 0;
            window.setTimeout(() => {
                this.setState(() => ({renderFlag: false}));
            }, updateTime)
        }
    }

    render() {
        return this.state.renderFlag ? (
            <div className = 'song-landing-page' id='song-landing-page'>
                <h1 className='cursive' id='song-landing-page-title'>Soundscape</h1>
                <h2 className='cursive' id='song-landing-page-subtitle'>by Mark Racette</h2>
                <p>This application uses audio.<br/>Use speakers or headphones for the best experience.</p>
                <button
                    onClick = {() => {
                        this.props.handleUpdateUserGesture(true);
                    }}
                >Ready</button>
            </div>
        ): null;
    }

}