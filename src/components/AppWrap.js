/* eslint-disable */

// libs
import React, { useState, useEffect } from 'react';
import * as d3Chromatic from 'd3-scale-chromatic';
import * as d3Color from 'd3-color';

// components
import AppRouter from './AppRouter';

// context
import LayoutContext from '../contexts/LayoutContext';
import TestingContext from '../contexts/TestingContext';

// load the app config flat file
const appConfig = require('../app-config.json');

// global behavior flags for testing
const flags = {
  quantizeSamples: false,
  showVisuals: false
};

// define spectrum functions here since they don't do well in json
const spectrumFunctions = {
  'moonrise': (n) => d3Color.color(d3Chromatic.interpolateViridis(n)).brighter(1.5),
  'mornings': (n) => d3Color.color(d3Chromatic.interpolateRdYlBu(.1 + n * .8))
};

// inits globals vars, adds listeners, and manages some other settings
const AppWrap = () => {

  // run once before the dom is drawn
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  document.documentElement.style.setProperty('--vw', `${viewportWidth / 100}px`);
  document.documentElement.style.setProperty('--vh', `${viewportHeight / 100}px`);

  // custom vw and vh vars
  const [vw, setvw] = useState(viewportWidth / 100);
  const [vh, setvh] = useState(viewportHeight / 100);

  useEffect(() => {

    // gets the inner height/width to act as viewport dimensions (cross-platform benefits)
    const setViewportVars = () => {

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // can be accessed in scss as vw(n), vh(n) OR in css as --vw * n, --vh * n
      document.documentElement.style.setProperty('--vw', `${viewportWidth / 100}px`);
      document.documentElement.style.setProperty('--vh', `${viewportHeight / 100}px`);

      // can be accessed in the theme context as vw * n or wh * n
      setvw(viewportWidth / 100);
      setvh(viewportHeight / 100);

    }

    // add listeners
    window.addEventListener('resize', setViewportVars);
    window.addEventListener('orientationchange', setViewportVars);
    window.addEventListener('fullscreenchange', setViewportVars);

    return () => {
      window.removeEventListener('resize', setViewportVars);
      window.removeEventListener('orientationchange', setViewportVars);
      window.removeEventListener('fullscreenchange', setViewportVars);
    }

  }, []);

  return (
    <TestingContext.Provider value={{ flags }}>
      <LayoutContext.Provider value={{ vw, vh }}>
        <AppRouter
          appConfig={appConfig}
          spectrumFunctions={spectrumFunctions}
        />
      </LayoutContext.Provider>
    </TestingContext.Provider>
  );

}

export default AppWrap;
