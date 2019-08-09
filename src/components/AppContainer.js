import React from 'react';
import AppRouter from '../routers/AppRouter';

export default class AppContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            config: require('../app-config.json')
        }
    }
    render() {
        return (
            <div>
                <AppRouter 
                    config = {this.state.config}
                />
            </div>
        );
    }
}