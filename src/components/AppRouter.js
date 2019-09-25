// libs
import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

// context
import { MusicPlayerContext } from '../contexts/MusicPlayerContext';

// components
import MusicPlayer from './MusicPlayer';
import LandingPage from './LandingPage';

function AppRouter(props) {
    return (
        <div>
        <Router>
            <Switch>
                <Route exact path='/' component={LandingPage} />
                <Route exact path={'/play/:songId'} render={routeProps => 

                    <MusicPlayerContext.Provider value = {
                        props.appConfig.find((song) => {
                            return song.id === routeProps.match.params.songId;
                        })
                    }>

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