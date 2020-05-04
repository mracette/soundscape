// libs
import React from "react";
import { Link } from "react-router-dom";

// components
import { MoonriseIcon } from "./custom-song-icons/MoonriseIcon";
import { MorningsIcon } from "./custom-song-icons/MorningsIcon";
import { ComingSoonIcon } from "./custom-song-icons/ComingSoonIcon";

// context
import { LayoutContext } from "../contexts/contexts";

// styles
import "../styles/components/LandingPage.scss";

// utils
import { addWindowListeners, removeWindowListeners } from "../utils/jsUtils";

// other
import { LandingPageScene } from "../viz/scenes/landing/LandingPageScene";

export const landingPageReducer = (state, action) => {
  switch (action.type) {
    case "moonrise":
      return {
        name: "Moonrise",
        bpm: "120",
        key: "G Minor",
      };
    case "mornings":
      return {
        name: "Mornings",
        bpm: "92",
        key: "Eb Major",
      };
    case "swamp":
      return {
        name: "Swamp",
        bpm: "???",
        key: "Eb Minor",
      };
    case "coming-soon":
      return {
        name: "The future of Soundscape...",
        bpm: null,
        key: null,
      };
    default:
      return {
        name: null,
        bpm: null,
        key: null,
      };
  }
};

export const LandingPage = (props) => {
  const { spectrumFunction } = props;
  const [selected, dispatch] = React.useReducer(landingPageReducer, {
    name: null,
    bpm: null,
    key: null,
  });

  const canvasRef = React.useRef(null);

  const { isMobile } = React.useContext(LayoutContext);

  React.useEffect(() => {
    let scene;

    if (canvasRef.current) {
      scene = new LandingPageScene(canvasRef.current, { spectrumFunction });
      addWindowListeners(scene.onWindowResize);
    }

    return () => {
      scene.stop();
      scene.disposeAll(scene.scene);
      removeWindowListeners(scene.onWindowResize);
    };
  }, [spectrumFunction]);

  return (
    <>
      <canvas id="star-canvas" className="fullscreen" ref={canvasRef} />
      <div id="landing-page" className="fullscreen transparent">
        <div className="landing-page-header">
          <div className="flex-row">
            <h1 id="landing-page-soundscape-title">Soundscape</h1>
          </div>
          <div className="flex-row">
            <span>This application uses audio.</span>
          </div>
          <div className="flex-row">
            <span>Use speakers or headphones for the best experience.</span>
          </div>
          <div className="flex-row">
            <p>
              {isMobile ? (
                <span id="choose-a-song">Choose a song to begin.</span>
              ) : (
                <>
                  <span
                    id={
                      selected.name
                        ? "landing-page-song-title"
                        : "choose-a-song"
                    }
                  >
                    {selected.name || "Choose a song to begin."}
                  </span>
                  {selected.bpm && (
                    <>
                      <span>&nbsp;|&nbsp;</span>{" "}
                      <span id="landing-page-bpm">{` ${selected.bpm} bpm`}</span>
                    </>
                  )}
                  {selected.key && (
                    <>
                      <span>&nbsp;|&nbsp;</span>{" "}
                      <span id="landing-page-key">{selected.key}</span>
                    </>
                  )}
                </>
              )}
            </p>
          </div>
        </div>
        <div id="song-selection-panel">
          <Link
            className="song-link"
            id="song-link-mornings"
            to="/play/mornings"
          >
            {isMobile && (
              <div className="landing-page-header">
                <div className="flex-row">
                  <span id="landing-page-song-title">Mornings</span>
                  &nbsp;|&nbsp;
                  <span id="landing-page-bpm">92</span>&nbsp;|&nbsp;
                  <span id="landing-page-key">Eb Major</span>
                </div>
              </div>
            )}
            <MorningsIcon name="mornings" dispatch={dispatch} />
          </Link>
          <Link
            className="song-link"
            id="song-link-moonrise"
            to="/play/moonrise"
          >
            {isMobile && (
              <div className="landing-page-header">
                <div className="flex-row">
                  <span id="landing-page-song-title">Moonrise</span>
                  &nbsp;|&nbsp;
                  <span id="landing-page-bpm">120</span>&nbsp;|&nbsp;
                  <span id="landing-page-key">G Minor</span>
                </div>
              </div>
            )}
            <MoonriseIcon name="moonrise" dispatch={dispatch} />
          </Link>
          <Link className="song-link" id="song-link-swamp" to="/play/swamp">
            {isMobile && (
              <div className="landing-page-header">
                <div className="flex-row">
                  <span id="landing-page-song-title">Swamp</span>
                  &nbsp;|&nbsp;
                  <span id="landing-page-bpm">???</span>&nbsp;|&nbsp;
                  <span id="landing-page-key">Eb Minor</span>
                </div>
              </div>
            )}
            <ComingSoonIcon name="coming-soon" dispatch={dispatch} />
          </Link>
          <Link
            className="song-link"
            id="song-link-coming-soon"
            to="/coming-soon"
          >
            {isMobile && (
              <div className="landing-page-header">
                <div className="flex-row">
                  <span id="landing-page-song-title">
                    The future of Soundscape...
                  </span>
                </div>
              </div>
            )}
            <ComingSoonIcon name="coming-soon" dispatch={dispatch} />
          </Link>
          {/* fillers to get the botton link visible on mobile */}
          <div className="filler"></div>
        </div>
      </div>
    </>
  );
};
