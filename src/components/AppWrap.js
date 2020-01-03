/* eslint-disable */

// libs
import React, { useState, useEffect } from 'react';
import * as d3Chromatic from 'd3-scale-chromatic';
import * as d3Color from 'd3-color';

// components
import AppRouter from './AppRouter';

// context
import LayoutContext from '../contexts/LayoutContext';

// loads configs, inits globals vars, adds listeners, and manages some other settings
const AppWrap = () => {

  // global behavior flags for testing
  const flagQuantizeSamples = false;
  const flagShowVisuals = false;

  // custom vw and vh vars
  const [vw, setvw] = useState();
  const [vh, setvh] = useState();

  useEffect(() => {

    // gets the inner height/width to act as viewport dimensions (cross-platform benefits)
    const setViewportVars = () => {

      console.log('setting new viewport vars');

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // can be accessed in scss as vw(n), vh(n) OR in css as --vw * n, --vh * n
      document.documentElement.style.setProperty('--vw', `${viewportWidth / 100}px`);
      document.documentElement.style.setProperty('--vh', `${viewportHeight / 100}px`);

      // can be accessed in the theme context as vw * n or wh * n
      setvw(viewportWidth / 100);
      setvh(viewportHeight / 100);

    }

    setViewportVars();

    // add listeners
    window.addEventListener('resize', setViewportVars);
    window.addEventListener('orientationchange', setViewportVars);
    window.addEventListener('fullscreenchange', setViewportVars);

    return () => {
      window.removeEventListener('resize', setViewportVars);
      window.removeEventListener('orientationchange', setViewportVars);
      window.removeEventListener('fullscreenchange', setViewportVars);
    }

  }, [])


  // load the app config flat file
  const appConfig = require('../app-config.json');

  const moonriseColors = {};

  moonriseColors.backgroundColor = '#1F262F';
  moonriseColors.spectrumFunction = (n) => d3Color.color(d3Chromatic.interpolateViridis(n)).brighter(1.5);
  moonriseColors.panelResetButton = 'rgba(255, 255, 255, 0.3)';
  moonriseColors.panelRandomizeButton = moonriseColors.panelResetButton;
  moonriseColors.panelMuteButton = moonriseColors.panelResetButton;
  moonriseColors.groupSoloButton = d3Color.color(d3Chromatic.interpolateViridis(0.30)).brighter(1.5);
  moonriseColors.groupSoloButton.opacity = 0.5;
  moonriseColors.groupMuteButton = d3Color.color(d3Chromatic.interpolateViridis(0.95)).brighter(3.5);
  moonriseColors.groupMuteButton.opacity = 0.5;

  const morningsColors = {};

  morningsColors.backgroundColor = '#1F262F';
  morningsColors.spectrumFunction = (n) => d3Color.color(d3Chromatic.interpolateRdYlBu(.1 + n * .8));
  morningsColors.panelResetButton = 'rgba(255, 255, 255, 0.3)';
  morningsColors.panelRandomizeButton = moonriseColors.panelResetButton;
  morningsColors.panelMuteButton = moonriseColors.panelResetButton;
  morningsColors.groupSoloButton = d3Color.color(d3Chromatic.interpolateViridis(0.30)).brighter(1.5);
  morningsColors.groupSoloButton.opacity = 0.5;
  morningsColors.groupMuteButton = d3Color.color(d3Chromatic.interpolateViridis(0.95)).brighter(3.5);
  morningsColors.groupMuteButton.opacity = 0.5;

  const themes = [{
    id: 'moonrise',
    ...moonriseColors
  }, {
    id: 'mornings',
    ...morningsColors
  }];

  return (
    <LayoutContext.Provider value={{ vw, vh }}>
      <AppRouter
        appConfig={appConfig}
        themes={themes}
      />
    </LayoutContext.Provider>
  );

}

export default AppWrap;
