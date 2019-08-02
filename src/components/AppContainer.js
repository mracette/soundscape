import React from 'react';
import AppRouter from '../routers/AppRouter';

export default class AppContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            config: require('./config.json')
        }
    }
    render() {
        return (
            <div>
                <h1>App Container</h1>
                <AppRouter 
                    config = {this.state.config}
                />
            </div>
        );
    }
}