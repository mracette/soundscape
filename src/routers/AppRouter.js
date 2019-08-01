import React from 'react';
import { BrowserRouter, Route, Switch, Link, NavLink } from 'react-router-dom';
import NavigationPanel from '../components/NavigationPanel';

const AppRouter = () => {
    return (
        <BrowserRouter>
            <div>
                <Switch>
                    <Route path="/" component = {NavigationPanel} />
                </Switch>
            </div>
        </BrowserRouter>
    )
}

export default AppRouter;