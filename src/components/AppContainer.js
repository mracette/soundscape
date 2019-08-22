import React from 'react';
import AppRouter from '../routers/AppRouter';
import MusicPlayer from '../components/MusicPlayer';
import SongLandingPage from '../components/SongLandingPage';

export default class AppContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            config: require('../app-config.json'),
            userGesture: true
        }

        this.handleUpdateUserGesture = this.handleUpdateUserGesture.bind(this);
        this.setViewportVars = this.setViewportVars.bind(this);

        // in order to support browser compatibility and mobile, the app uses
        // a calculated version of the vh and vw units that is based on the 
        // window's innerwidth and innerheight at a given time.
        this.setViewportVars();

        // make sure that the --vw and --vh vars update on window resize
        // and orientation change
        window.addEventListener('resize', this.setViewportVars);
        window.addEventListener('orientationchange', this.setViewportVars);

        // this means that the svg attributes that can't be set in CSS will
        // also require updating
        window.addEventListener('resize', this.setSvgAttrs);
        window.addEventListener('orientationchange', this.setSvgAttrs);


    }

    setViewportVars() {
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        document.documentElement.style.setProperty('--vh', `${viewportHeight/100}px`);
        document.documentElement.style.setProperty('--vw', `${viewportWidth/100}px`);
    }

    setSvgAttrs() {
        const svgList = document.getElementsByClassName('svg');
        const svgCircleList = document.getElementsByClassName('toggle-svg');

        for(let i = 0; i < svgList.length; i++) {
            const svg = svgList[i];
            svg.setAttribute('width',  (3 * 2 * (window.innerHeight / 100))+'px');
            svg.setAttribute('height', (3 * 2 * (window.innerHeight / 100))+'px');
        }

        for(let j = 0; j < svgCircleList.length; j++) {
            const circle = svgCircleList[j];
            circle.setAttribute('cx', (3 * (window.innerHeight / 100))+'px');
            circle.setAttribute('cy', (3 * (window.innerHeight / 100))+'px');
            circle.setAttribute('r', ((3 - 0.1) * (window.innerHeight / 100))+'px');
        }
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