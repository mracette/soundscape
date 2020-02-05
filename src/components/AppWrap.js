// libs
import React from 'react';
import * as d3Chromatic from 'd3-scale-chromatic';
import * as d3Color from 'd3-color';
import { ColorPalette } from 'color-curves'

// components
import { AppRouter } from './AppRouter';

// context
import { LayoutContext } from '../contexts/contexts';
import { TestingContext } from '../contexts/contexts';

// const palette = new ColorPalette('{"type":"exponential","overflow":"clamp","reverse":true,"translation":{"x":-0.924,"y":-0.383},"scale":{"x":1.848,"y":0.765},"rotation":0,"variation":"in"}', '{"type":"linear","overflow":"clamp","reverse":true,"translation":{"x":-0.053,"y":0.479},"scale":{"x":1.053,"y":0.271},"rotation":0}', '{"start":0,"end":1}');
// const palette = new ColorPalette('{"type":"exponential","overflow":"clamp","reverse":true,"translation":{"x":-0.899,"y":-0.445},"scale":{"x":1.854,"y":0.627},"rotation":0,"variation":"in"}', '{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":0.531,"y":0.829},"scale":{"x":1,"y":1},"rotation":0,"angleStart":4.053,"angleEnd":6.283,"angleOffset":-0.377,"radius":0.25}', '{"start":0,"end":1}');
// const palette = new ColorPalette('{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":0.126,"y":0.402},"scale":{"x":0.37,"y":1.13},"rotation":-0.188,"angleStart":2.922,"angleEnd":5.938,"angleOffset":0.283,"radius":0.51}', '{"type":"linear","overflow":"clamp","reverse":false,"translation":{"x":0.132,"y":0.46},"scale":{"x":0.756,"y":0.13},"rotation":0}', '{"start":0,"end":0.9}');
// const palette = new ColorPalette('{"type":"linear","overflow":"clamp","reverse":false,"translation":{"x":-0.484,"y":-0.462},"scale":{"x":0.93,"y":0.765},"rotation":3.236}', '{"type":"linear","overflow":"clamp","reverse":false,"translation":{"x":0.295,"y":0.655},"scale":{"x":0.906,"y":0.047},"rotation":0}', '{"start":0,"end":1}');

// const palette = new ColorPalette('{"type":"linear","overflow":"clamp","reverse":true,"translation":{"x":-0.93,"y":-0.696},"scale":{"x":1.491,"y":0.596},"rotation":0}', '{"type":"exponential","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0.766},"scale":{"x":0.997,"y":-0.119},"rotation":0,"variation":"in"}', '{"start":0,"end":1}');
// const palette = new ColorPalette('{"type":"linear","overflow":"clamp","reverse":true,"translation":{"x":-0.93,"y":-0.696},"scale":{"x":1.491,"y":0.596},"rotation":3.11}', '{"type":"exponential","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0.766},"scale":{"x":0.997,"y":-0.119},"rotation":0,"variation":"in"}', '{"start":0,"end":1}');

// const palette = new ColorPalette('{"type":"exponential","overflow":"clamp","reverse":false,"translation":{"x":0.606,"y":0.275},"scale":{"x":-1.43,"y":-0.85},"rotation":0,"variation":"in"}', '{"type":"linear","overflow":"clamp","reverse":false,"translation":{"x":0.053,"y":0.626},"scale":{"x":0.903,"y":0.089},"rotation":0}', '{"start":0,"end":1}');

// const palette = new ColorPalette('{"type":"arc","overflow":"clamp","reverse":true,"translation":{"x":0,"y":0},"scale":{"x":1,"y":1},"rotation":0,"angleStart":3.77,"angleEnd":6.283,"angleOffset":-0.251,"radius":0.5}', '{"type":"linear","overflow":"clamp","reverse":true,"translation":{"x":0.013,"y":0.711},"scale":{"x":0.981,"y":-0.042},"rotation":0}', '{"start":0,"end":1}');
// const palette = new ColorPalette('{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0},"scale":{"x":1,"y":1},"rotation":0,"angleStart":3.77,"angleEnd":6.283,"angleOffset":-0.251,"radius":0.5}', '{"type":"linear","overflow":"clamp","reverse":true,"translation":{"x":0.013,"y":0.711},"scale":{"x":0.981,"y":-0.042},"rotation":0}', '{"start":0,"end":1}');

//const palette = new ColorPalette('{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0},"scale":{"x":1,"y":1},"rotation":0,"angleStart":0,"angleEnd":6.283,"angleOffset":0,"radius":0.43}', '{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":0.509,"y":0.491},"scale":{"x":1,"y":1},"rotation":0,"angleStart":0,"angleEnd":6.283,"angleOffset":0,"radius":0.18}', '{"start":0,"end":1}');
//const palette = new ColorPalette('{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":0,"y":0},"scale":{"x":1,"y":1},"rotation":0,"angleStart":1.571,"angleEnd":6.283,"angleOffset":0.314,"radius":0.43}', '{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":0.506,"y":0.588},"scale":{"x":1,"y":1},"rotation":0,"angleStart":2.231,"angleEnd":6.283,"angleOffset":12.346,"radius":0.18}', '{"start":0,"end":1}');
//const palette = new ColorPalette('{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":-0.088,"y":-0.226},"scale":{"x":1,"y":1},"rotation":0,"angleStart":0,"angleEnd":3.142,"angleOffset":5.686,"radius":0.5}', '{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":0.5,"y":0.5},"scale":{"x":1,"y":1},"rotation":0,"angleStart":0,"angleEnd":6.283,"angleOffset":-0.974,"radius":0.25}', '{"start":0,"end":1}');

//const palette = new ColorPalette('{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":-0.088,"y":-0.226},"scale":{"x":1,"y":1},"rotation":0,"angleStart":0,"angleEnd":3.142,"angleOffset":7.257,"radius":0.5}', '{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":0.5,"y":0.5},"scale":{"x":1,"y":1},"rotation":0,"angleStart":0,"angleEnd":6.283,"angleOffset":-0.974,"radius":0.25}', '{"start":0,"end":1}');
const palette = new ColorPalette('{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":-0.125,"y":-0.081},"scale":{"x":1,"y":1},"rotation":0,"angleStart":0,"angleEnd":3.142,"angleOffset":5.781,"radius":0.5}', '{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":0.5,"y":0.5},"scale":{"x":1,"y":1},"rotation":0,"angleStart":0,"angleEnd":3.424,"angleOffset":0.628,"radius":0.25}', '{"start":0,"end":1}');// load the app config flat file
const appConfig = require('../app-config.json');

// global behavior flags for testing
const flags = {
  quantizeSamples: false,
  showVisuals: true,
  playAmbientTrack: false
};

// define spectrum functions here since they don't do well in json
const spectrumFunctions = {
  'moonrise': (n) => d3Chromatic.interpolateViridis(n).brighter(1.5),
  'mornings': (n) => palette.rgbValueAt(n)
};

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