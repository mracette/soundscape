// libs
import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

// context
import { ThemeContext } from '../contexts/contexts';
import { MusicPlayerContext } from '../contexts/contexts';

// components
import { MusicPlayerWrap } from './MusicPlayerWrap';
import { LandingPage } from './LandingPage';

export const AppRouter = (props) => {
    return (
        <div>
            <Router>
                <Switch>
                    <Route exact path='/' component={LandingPage} />
                    <Route exact path={'/play/:songId'} render={routeProps =>

                        <ThemeContext.Provider value={{
                            // provide the song's themes
                            id: routeProps.match.params.songId,
                            spectrumFunction: props.spectrumFunctions[routeProps.match.params.songId],
                            ...props.appConfig.find((song) => {
                                return song.id === routeProps.match.params.songId;
                            })["themes"]
                        }}>

                            <MusicPlayerContext.Provider value={{
                                // provide the song's music player config
                                id: routeProps.match.params.songId,
                                ...props.appConfig.find((song) => {
                                    return song.id === routeProps.match.params.songId;
                                })["audio"]
                            }}>

                                <MusicPlayerWrap {...routeProps} />

                            </MusicPlayerContext.Provider>

                        </ThemeContext.Provider>

                    } />
                    <Redirect to='/' />
                </Switch>
            </Router>
        </div>
    )
}