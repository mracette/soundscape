/* eslint-disable */

// libs
import React from 'react';

// components
import AppWrap from './AppWrap';
import WebGLUnavailable from './WebGLUnavailable';

// other
import { WEBGL } from 'three/examples/jsm/WebGL';

// styles
import '../styles/app.scss';

const App = () => {

  // check if webgl is available, if not, show the error page
  if (WEBGL.isWebGLAvailable()) {

    // return the application JSX
    return (

      <div id='app-container' className='fullscreen'>

        <AppWrap />

      </div>

    );

  } else {

    return <WebGLUnavailable />

  }

}

export default App;
