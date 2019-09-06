import React from 'react';
import { WEBGL } from 'three/examples/jsm/WebGL';
import AppRouter from './AppRouter';
import WebGLUnavailable from './WebGLUnavailable';
import '../styles/app.scss';

const App = () => {

  // check if webgl is available, if not, show the error page
  if(WEBGL.isWebGLAvailable()) {

    // load the app config flat file
    const appConfig = require('../app-config.json');

    // set the mock viewport variables and store in the document style
    setViewportVars();
    window.addEventListener('resize', setViewportVars);
    window.addEventListener('orientationchange', setViewportVars);
    window.addEventListener('fullscreenchange', setViewportVars);

    // return the application JSX
    return (
      <div id = 'app-container' className = 'fullscreen'>
        <AppRouter appConfig = {appConfig}/>
      </div>
    );

  } else {

    return <WebGLUnavailable />

  }

}

const setViewportVars = () => {

  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  document.documentElement.style.setProperty('--vh', `${viewportHeight/100}px`);
  document.documentElement.style.setProperty('--vw', `${viewportWidth/100}px`);

}

export default App;
