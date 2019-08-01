import React from 'react';
import { BrowserRouter, Route, Switch, Link, NavLink } from 'react-router-dom';
import MusicPlayer from '../components/MusicPlayer';

const AppRouter = () => {
    return (
        <BrowserRouter>
            <div>
                <Switch>
                    <Route path="/" component = {MusicPlayer} />
                </Switch>
            </div>
        </BrowserRouter>
    )
}

export default AppRouter;