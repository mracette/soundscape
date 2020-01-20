// libs
import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

// context
import { ThemeContext } from '../contexts/contexts';
import { SongContext } from '../contexts/contexts';

// components
import { MusicPlayer } from './MusicPlayer';
import { LandingPage } from './LandingPage';

export const AppRouter = (props) => {
    return (
        <Router>
            <Switch>
                <Route exact path='/' component={LandingPage} />
                <Route exact path={'/play/:songId'} render={routeProps =>

                    <ThemeContext.Provider value={{
                        // provide the song's theme context
                        id: routeProps.match.params.songId,
                        spectrumFunction: props.spectrumFunctions[routeProps.match.params.songId],
                        ...props.appConfig.find((song) => {
                            return song.id === routeProps.match.params.songId;
                        })["themes"]
                    }}>

                        <SongContext.Provider value={{
                            // provide the song context
                            id: routeProps.match.params.songId,
                            ...props.appConfig.find((song) => {
                                return song.id === routeProps.match.params.songId;
                            })["audio"]
                        }}>

                            <MusicPlayer />

                        </SongContext.Provider>

                    </ThemeContext.Provider>

                } />
                <Redirect to='/' />
            </Switch>
        </Router>
    )
}