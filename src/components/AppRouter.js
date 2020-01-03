// libs
import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

// context
import ThemeContext from '../contexts/ThemeContext';
import MusicPlayerContext from '../contexts/MusicPlayerContext';

// components
import MusicPlayerWrap from './MusicPlayerWrap';
import LandingPage from './LandingPage';

function AppRouter(props) {

    console.log(props);

    return (
        <div>
            <Router>
                <Switch>
                    <Route exact path='/' component={LandingPage} />
                    <Route exact path={'/play/:songId'} render={routeProps =>

                        <ThemeContext.Provider value={{
                            // provide the song's themes
                            ...props.themes.find((song) => {
                                return song.id === routeProps.match.params.songId;
                            })
                        }}>

                            <MusicPlayerContext.Provider value={{
                                // provide the song's music player config
                                ...props.appConfig.find((song) => {
                                    return song.id === routeProps.match.params.songId;
                                })
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

export default AppRouter;