// libs
import React from "react";
import * as d3Chromatic from "d3-scale-chromatic";
import * as d3Color from "d3-color";
import { ColorPalette } from "color-curves";

// components
import { AppRouter } from "./AppRouter";

// context
import { LayoutContext } from "../contexts/contexts";
import { TestingContext } from "../contexts/contexts";
import { WebAudioContext } from "../contexts/contexts";

// classes
import { WebAudioWrapper } from "../classes/WebAudioWrapper";

// utils
import { addWindowListeners, removeWindowListeners } from "../utils/jsUtils";

const morningsPalette = new ColorPalette(
  '{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":-0.125,"y":-0.081},"scale":{"x":1,"y":1},"rotation":0,"angleStart":0,"angleEnd":3.142,"angleOffset":5.781,"radius":0.5}',
  '{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":0.5,"y":0.5},"scale":{"x":1,"y":1},"rotation":0,"angleStart":0,"angleEnd":3.424,"angleOffset":0.628,"radius":0.25}',
  '{"start":0,"end":1}'
); // load the app config flat file
const morningsPaletteDiscrete = [];
const moonrisePaletteDiscrete = [];

// instead of querying the full palettes, use a discrete, in-memory versions to save compute
for (let i = 0; i <= 255; i++) {
  morningsPaletteDiscrete.push(morningsPalette.rgbValueAt(i / 255));
  moonrisePaletteDiscrete.push(
    new d3Color.color(d3Chromatic.interpolateViridis(i / 255)).brighter(1.5)
  );
}

const appConfig = require("../app-config.json");
const webAudioWrapper = new WebAudioWrapper(appConfig);

// global behavior flags for testing
const flags = {
  quantizeSamples: false,
  showVisuals: true,
  playAmbientTrack: false,
};

// define spectrum functions here since they don't do well in json
const spectrumFunctions = {
  moonrise: (n) => moonrisePaletteDiscrete[Math.round(n * 255)],
  mornings: (n) => morningsPaletteDiscrete[Math.round(n * 255)],
};

// inits globals vars, adds listeners, and manages some other settings
export const AppWrap = () => {
  const [wawLoadStatus, setWawLoadStatus] = React.useState(false);
  webAudioWrapper.initAppState().then(() => setWawLoadStatus(true));

  // run once before the dom is drawn
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  document.documentElement.style.setProperty(
    "--vw",
    `${viewportWidth / 100}px`
  );
  document.documentElement.style.setProperty(
    "--vh",
    `${viewportHeight / 100}px`
  );

  // custom vw and vh vars
  const [vw, setvw] = React.useState(viewportWidth / 100);
  const [vh, setvh] = React.useState(viewportHeight / 100);

  // check for mobile
  const [isMobile, setIsMobile] = React.useState(viewportWidth <= 760);

  React.useEffect(() => {
    const resumeAudio = () => {
      webAudioWrapper.audioCtx.state === "suspended" &&
        webAudioWrapper.audioCtx.resume();
    };

    // gets the inner height/width to act as viewport dimensions (cross-platform benefits)
    const setViewportVars = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // can be accessed in scss as vw(n), vh(n) OR in css as --vw * n, --vh * n
      document.documentElement.style.setProperty(
        "--vw",
        `${viewportWidth / 100}px`
      );
      document.documentElement.style.setProperty(
        "--vh",
        `${viewportHeight / 100}px`
      );

      // can be accessed in the theme context as vw * n or wh * n
      setvw(viewportWidth / 100);
      setvh(viewportHeight / 100);
      setIsMobile(viewportWidth <= 760);
    };

    // add resize listeners
    addWindowListeners(setViewportVars);

    // add listeners to unlock audio
    document.body.addEventListener("touchstart", resumeAudio);
    document.body.addEventListener("click", resumeAudio);

    return () => {
      removeWindowListeners(setViewportVars);
      document.body.removeEventListener("touchstart", resumeAudio);
      document.body.removeEventListener("click", resumeAudio);
    };
  }, []);

  return (
    <WebAudioContext.Provider value={{ WAW: webAudioWrapper, wawLoadStatus }}>
      <TestingContext.Provider value={{ flags }}>
        <LayoutContext.Provider value={{ vw, vh, isMobile }}>
          <AppRouter
            appConfig={appConfig}
            spectrumFunctions={spectrumFunctions}
          />
        </LayoutContext.Provider>
      </TestingContext.Provider>
    </WebAudioContext.Provider>
  );
};
