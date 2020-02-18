// libs
import React from 'react';
import * as d3Chromatic from 'd3-scale-chromatic';
import * as d3Color from 'd3-color';
import { ColorPalette } from 'color-curves'

// components
import { AppRouter } from './AppRouter';

// others
import { initGain } from '../utils/audioUtils';
import { Scheduler } from '../classes/Scheduler';

// context
import { LayoutContext } from '../contexts/contexts';
import { TestingContext } from '../contexts/contexts';

const morningsPalette = new ColorPalette('{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":-0.125,"y":-0.081},"scale":{"x":1,"y":1},"rotation":0,"angleStart":0,"angleEnd":3.142,"angleOffset":5.781,"radius":0.5}', '{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":0.5,"y":0.5},"scale":{"x":1,"y":1},"rotation":0,"angleStart":0,"angleEnd":3.424,"angleOffset":0.628,"radius":0.25}', '{"start":0,"end":1}');// load the app config flat file
const appConfig = require('../app-config.json');

// global behavior flags for testing
const flags = {
  quantizeSamples: true,
  showVisuals: true,
  playAmbientTrack: true
};

// define spectrum functions here since they don't do well in json
const spectrumFunctions = {
  'moonrise': (n) => new d3Color.color(d3Chromatic.interpolateViridis(n)).brighter(1.5),
  'mornings': (n) => morningsPalette.rgbValueAt(n)
};

// globals
const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
const premaster = initGain(audioCtx, 1);
premaster.connect(audioCtx.destination);
const scheduler = new Scheduler(audioCtx);

// inits globals vars, adds listeners, and manages some other settings
export const AppWrap = () => {

  // run once before the dom is drawn
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  document.documentElement.style.setProperty('--vw', `${viewportWidth / 100}px`);
  document.documentElement.style.setProperty('--vh', `${viewportHeight / 100}px`);

  // custom vw and vh vars
  const [vw, setvw] = React.useState(viewportWidth / 100);
  const [vh, setvh] = React.useState(viewportHeight / 100);

  const resumeAudio = () => { audioCtx.state === 'suspended' && audioCtx.resume(); }

  React.useEffect(() => {

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

    // add resize listeners
    window.addEventListener('resize', setViewportVars);
    window.addEventListener('orientationchange', setViewportVars);
    window.addEventListener('fullscreenchange', setViewportVars);
    window.visualViewport && (window.visualViewport.addEventListener('scroll', setViewportVars));
    window.visualViewport && (window.visualViewport.addEventListener('resize', setViewportVars));

    // add listeners to unlock audio
    document.body.addEventListener('touchstart', resumeAudio);
    document.body.addEventListener('click', resumeAudio);

    return () => {
      window.removeEventListener('resize', setViewportVars);
      window.removeEventListener('orientationchange', setViewportVars);
      window.removeEventListener('fullscreenchange', setViewportVars);
      window.visualViewport && (window.visualViewport.removeEventListener('scroll', setViewportVars));
      window.visualViewport && (window.visualViewport.removeEventListener('resize', setViewportVars));
      document.body.removeEventListener('touchstart', resumeAudio);
      document.body.removeEventListener('click', resumeAudio);
    }

  }, []);

  return (
    <TestingContext.Provider value={{ flags }}>
      <LayoutContext.Provider value={{ vw, vh }}>
        <AppRouter
          appConfig={appConfig}
          spectrumFunctions={spectrumFunctions}
          audioCtx={audioCtx}
          scheduler={scheduler}
          premaster={premaster}
        />
      </LayoutContext.Provider>
    </TestingContext.Provider>
  );

}