/* eslint-disable */ 

// libs
import React, { useState, useEffect } from 'react';

// components
import AppRouter from './AppRouter';
import WebGLUnavailable from './WebGLUnavailable';

// context
import ThemeContext from '../contexts/ThemeContext';

// other
import { WEBGL } from 'three/examples/jsm/WebGL';

// styles
import '../styles/app.scss';

const App = () => {

  // initialize theme context
  const [vw, setvw] = useState(window.innerWidth / 100);
  const [vh, setvh] = useState(window.innerHeight / 100);

  useEffect(() => {
    
    // add listeners
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    window.addEventListener('fullscreenchange', resize);
          
    }, []);

    const resize = () => {
      setViewportVars();
    }

    // get the inner height/width to act as viewport dimensions (cross-platform benefits)
    const setViewportVars = () => {
  
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
    
      // can be accessed in scss as vw(n), vh(n) OR in css as --vw * n, --vh * n
      document.documentElement.style.setProperty('--vw', `${viewportWidth/100}px`);
      document.documentElement.style.setProperty('--vh', `${viewportHeight/100}px`);
    
      // can be accessed in the theme context as vw * n or wh * n
      setvw(viewportWidth / 100);
      setvh(viewportHeight / 100);
    
    }

  // check if webgl is available, if not, show the error page
  if(WEBGL.isWebGLAvailable()) {

    // load the app config flat file
    const appConfig = require('../app-config.json');

    // return the application JSX
    return (

      <div id = 'app-container' className = 'fullscreen'>

        <ThemeContext.Provider value = {{vw, vh}}>

          <AppRouter appConfig = {appConfig}/>

        </ThemeContext.Provider>

      </div>

    );

  } else {

    return <WebGLUnavailable />

  }

}

export default App;
