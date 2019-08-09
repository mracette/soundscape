import React from 'react';
import { BrowserRouter, Route, Switch, Link, NavLink } from 'react-router-dom';
import NavigationPanel from '../components/NavigationPanel';
import MusicPlayer from '../components/MusicPlayer';

const AppRouter = (props) => {
    return (
        <BrowserRouter>
                <Route exact path="/" render = {(routeProps) => {
                    return (
                    <NavigationPanel
                        {...routeProps}
                        config = {props.config}
                    />
                    );
                }}/>
                <Route path="/play/:songName" render = {(routeProps) => {
                    return (
                    <MusicPlayer
                        {...routeProps}
                        songConfig = {props.config.find((song) => (song.name === routeProps.match.params.songName))}
                    />
                    );
                }}/>
        </BrowserRouter>
    );
}

export default AppRouter;