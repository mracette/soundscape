// 3rd party
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

// Internal
import AppRouter from './routers/AppRouter';
//import AudioManager from './audio/AudioManager';
import ConfigureStore from './store/ConfigureStore';

// Styles
import 'normalize.css/normalize.css';
import './styles/styles.scss';

const store = ConfigureStore();

// const audioManager = new AudioManager();
// audioManager.loadPlayers().then(() => {
//     console.log('success loading players');
//     audioManager.setSongState();
// }).catch((err) => {
//     console.error(err);
// });

const jsx = (
    <Provider store = {store}>
        <AppRouter />
    </Provider>
)

ReactDOM.render(jsx, document.getElementById('app'))
