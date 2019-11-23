// libs
import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import * as d3Chromatic from 'd3-scale-chromatic';
import * as d3Color from 'd3-color';

// context
import MusicPlayerContext from '../contexts/MusicPlayerContext';

// components
import MusicPlayer from './MusicPlayer';
import LandingPage from './LandingPage';

function AppRouter(props) {

    const moonriseColors = {};

    moonriseColors.backgroundColor = '#1F262F';
    moonriseColors.spectrumFunction = (n) => d3Color.color(d3Chromatic.interpolateViridis(n)).brighter(1.5);
    moonriseColors.panelResetButton = 'rgba(255, 255, 255, 0.3)';
    moonriseColors.panelRandomizeButton = moonriseColors.panelResetButton;
    moonriseColors.panelMuteButton = moonriseColors.panelResetButton;
    moonriseColors.groupSoloButton = d3Color.color(d3Chromatic.interpolateViridis(0.30)).brighter(1.5);
    moonriseColors.groupSoloButton.opacity = 0.5;
    moonriseColors.groupMuteButton = d3Color.color(d3Chromatic.interpolateViridis(0.95)).brighter(3.5);
    moonriseColors.groupMuteButton.opacity = 0.5;

    const morningsColors = {};

    morningsColors.backgroundColor = '#1F262F';
    morningsColors.spectrumFunction = (n) => d3Color.color(d3Chromatic.interpolateRdYlBu(.1 + n*.8));
    morningsColors.panelResetButton = 'rgba(255, 255, 255, 0.3)';
    morningsColors.panelRandomizeButton = moonriseColors.panelResetButton;
    morningsColors.panelMuteButton = moonriseColors.panelResetButton;
    morningsColors.groupSoloButton = d3Color.color(d3Chromatic.interpolateViridis(0.30)).brighter(1.5);
    morningsColors.groupSoloButton.opacity = 0.5;
    morningsColors.groupMuteButton = d3Color.color(d3Chromatic.interpolateViridis(0.95)).brighter(3.5);
    morningsColors.groupMuteButton.opacity = 0.5;

    let themes = [{
        id: 'moonrise',
        ...moonriseColors
    }, {
        id: 'mornings',
        ...morningsColors
    }];

    return (
        <div>
        <Router>
            <Switch>
                <Route exact path='/' component={LandingPage} />
                <Route exact path={'/play/:songId'} render={routeProps => 

                    <MusicPlayerContext.Provider value = {{
                        // get the song config from app-config.json
                        ...props.appConfig.find((song) => {
                            return song.id === routeProps.match.params.songId;
                        }),
                        // get the theme from the inline themes config
                        ...themes.find((song) => {
                            return song.id === routeProps.match.params.songId;
                        })
                    }}>

                        <MusicPlayer {...routeProps} />

                    </MusicPlayerContext.Provider>

                } />
                <Redirect to='/' />
            </Switch>
        </Router>
        </div>
    )
}

export default AppRouter;