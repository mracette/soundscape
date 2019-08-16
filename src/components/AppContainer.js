import React from 'react';
import AppRouter from '../routers/AppRouter';
import MusicPlayer from '../components/MusicPlayer';

export default class AppContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            config: require('../app-config.json')
        }
    }
    render() {
        return (
            <div>
                {/* <AppRouter 
                    config = {this.state.config}
                /> */}
                <MusicPlayer
                    songConfig = {this.state.config[0]}
                />
            </div>
        );
    }
}