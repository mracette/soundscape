import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import MusicPlayer from './MusicPlayer';
import LandingPage from './LandingPage';
import { tsPropertySignature } from '@babel/types';

function AppRouter(props) {
    console.log(props.appConfig);
    return (
        <div>
        <Router>
            <Switch>
                <Route exact path='/' component={LandingPage} />
                <Route exact path={'/play/:songId'} render={routeProps => 
                    <MusicPlayer 
                        {...routeProps}
                        songConfig = {
                            props.appConfig.find((song) => {
                                return song.id === routeProps.match.params.songId;
                            })
                        }
                    />
                } />
                <Redirect to='/' />
            </Switch>
        </Router>
        </div>
    )
}

export default AppRouter;