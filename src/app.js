// 3rd Party
import React from 'react';
import ReactDOM from 'react-dom';

// Components 
// import AppRouter from './routers/AppRouter';
import AppContainer from './components/AppContainer';

// Styles
import './styles/styles.scss';

const jsx = (
    <AppContainer />
)

ReactDOM.render(jsx, document.getElementById('app'));