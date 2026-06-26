import { useState, useEffect, useLayoutEffect } from "react";
import * as d3Chromatic from "d3-scale-chromatic";
import * as d3Color from "d3-color";
import { ColorPalette } from "color-curves";
import chroma from "chroma-js";
import { clamp } from "../utils/mathUtils";
import { AppRouter } from "./AppRouter";
import { LayoutContext } from "../contexts/contexts";
import { TestingContext } from "../contexts/contexts";
import { WebAudioContext } from "../contexts/contexts";
import { WebAudioWrapper } from "../classes/WebAudioWrapper";
import { addWindowListeners, removeWindowListeners } from "../utils/jsUtils";
import { AppConfigEntry } from "../contexts/contexts";
import _appConfig from "../app-config.json";
import { installTestHooks } from "../testHooks";

const appConfig = _appConfig as unknown as AppConfigEntry[];

const starsPalette = new ColorPalette(
  '{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":-0.182,"y":-0.138},"scale":{"x":1,"y":1},"rotation":0,"angleStart":2.105,"angleEnd":6.283,"angleOffset":0,"radius":0.5}',
  '{"type":"linear","overflow":"clamp","reverse":false,"translation":{"x":-0.003,"y":0.758},"scale":{"x":1.053,"y":-0.13},"rotation":0}',
  '{"start":0,"end":1}'
);

const morningsPalette = new ColorPalette(
  '{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":-0.125,"y":-0.081},"scale":{"x":1,"y":1},"rotation":0,"angleStart":0,"angleEnd":3.142,"angleOffset":5.781,"radius":0.5}',
  '{"type":"arc","overflow":"clamp","reverse":false,"translation":{"x":0.5,"y":0.5},"scale":{"x":1,"y":1},"rotation":0,"angleStart":0,"angleEnd":3.424,"angleOffset":0.628,"radius":0.25}',
  '{"start":0,"end":1}'
);

const swampPalette = (n: number): string => {
  const darkBlue = new chroma("#5669AE");
  const purple = new chroma("#9A4A91");
  const green = new chroma("#53DD6C");
  n = clamp(n, 0, 1);
  if (n <= 0.5) {
    return chroma.mix(darkBlue, purple, n / 0.5, "rgb").hex();
  } else {
    return chroma.mix(purple, green, (n - 0.5) / 0.5).hex();
  }
};

const morningsPaletteDiscrete: string[] = [];
const moonrisePaletteDiscrete: string[] = [];
const starsPaletteDiscrete: string[] = [];

// instead of querying the full palettes, use a discrete, in-memory versions to save compute
for (let i = 0; i <= 255; i++) {
  morningsPaletteDiscrete.push(morningsPalette.rgbValueAt(i / 255));
  moonrisePaletteDiscrete.push(
    d3Color.color(d3Chromatic.interpolateViridis(i / 255))!.brighter(1.5).toString()
  );
  starsPaletteDiscrete.push(starsPalette.rgbValueAt(i / 255));
}

// define spectrum functions here since they don't do well in json
const spectrumFunctions: Record<string, (n: number) => string> = {
  moonrise: (n: number) => moonrisePaletteDiscrete[Math.round(n * 255)],
  mornings: (n: number) => morningsPaletteDiscrete[Math.round(n * 255)],
  stars: (n: number) => starsPaletteDiscrete[Math.round(n * 255)],
  swamp: swampPalette,
};

const webAudioWrapper = new WebAudioWrapper(appConfig);

if (import.meta.env.DEV) {
  installTestHooks(webAudioWrapper);
}

// global behavior flags for testing
const flags = {
  quantizeSamples: true,
  showVisuals: true,
  playAmbientTrack: true,
};

// inits globals vars, adds listeners, and manages some other settings
export const AppWrap = () => {
  const [wawLoadStatus, setWawLoadStatus] = useState(false);

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const [vw, setvw] = useState(viewportWidth / 100);
  const [vh, setvh] = useState(viewportHeight / 100);
  const [isMobile, setIsMobile] = useState(viewportWidth <= 670);

  // Initialize persistent app-level WebAudio nodes once on mount.
  // initAppState() is internally idempotent (guarded by status.app).
  useEffect(() => {
    webAudioWrapper.initAppState().then(() => setWawLoadStatus(true));
  }, []);

  // Set the --vw/--vh custom properties before first paint (layout effect runs
  // pre-paint). Styles read them via calc(var(--vh, 1vh) * n).
  useLayoutEffect(() => {
    document.documentElement.style.setProperty(
      "--vw",
      `${window.innerWidth / 100}px`
    );
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight / 100}px`
    );
  }, []);

  useEffect(() => {
    const resumeAudio = () => {
      webAudioWrapper.audioCtx.state === "suspended" &&
        webAudioWrapper.audioCtx.resume();
    };

    // gets the inner height/width to act as viewport dimensions (cross-platform benefits)
    const setViewportVars = () => {
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

      // can be accessed in the theme context as vw * n or wh * n
      setvw(viewportWidth / 100);
      setvh(viewportHeight / 100);
      setIsMobile(viewportWidth <= 670);
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
