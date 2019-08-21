import React from 'react';
import AppRouter from '../routers/AppRouter';
import MusicPlayer from '../components/MusicPlayer';
import SongLandingPage from '../components/SongLandingPage';

export default class AppContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            config: require('../app-config.json'),
            userGesture: false
        }
        this.handleUpdateUserGesture = this.handleUpdateUserGesture.bind(this);
    }

    handleUpdateUserGesture(bool) {
        // the webaudio context won't start unless there has been
        // a user gesture detected on the page first, so keep track
        // of that (and update it) here.
        this.setState(() => ({userGesture: bool}));
    }

    render() {
        return (
            <div className = 'app-container'>
                {/* <AppRouter 
                    config = {this.state.config}
                /> */}
                <SongLandingPage 
                    handleUpdateUserGesture = {this.handleUpdateUserGesture}
                    userGesture = {this.state.userGesture}
                />
                <MusicPlayer
                    songConfig = {this.state.config[0]}
                    userGesture = {this.state.userGesture}
                />
            </div>
        );
    }
}