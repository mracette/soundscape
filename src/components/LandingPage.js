// libs
import React from "react";
import { Link } from "react-router-dom";

// components
import { MoonriseIcon } from "./custom-song-icons/MoonriseIcon";
import { MorningsIcon } from "./custom-song-icons/MorningsIcon";
import { SwampIcon } from "./custom-song-icons/SwampIcon";
import { ComingSoonIcon } from "./custom-song-icons/ComingSoonIcon";

// context
import { LayoutContext } from "../contexts/contexts";

// styles
import "../styles/components/LandingPage.scss";

// utils
import { addWindowListeners, removeWindowListeners } from "../utils/jsUtils";

// other
import { LandingPageScene } from "../viz/scenes/landing/LandingPageScene";
import { LandingPageMobile } from "./LandingPageMobile";

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
        bpm: "75",
        key: "Eb Minor",
      };
    case "coming-soon":
      return {
        name: "Information & Updates",
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
      <canvas id="landing-page-canvas" className="fullscreen" ref={canvasRef} />
      <div
        id="landing-page"
        className="fullscreen transparent"
        style={{ paddingTop: "10rem" }}
      >
        <div className="landing-page-header">
          <div className="flex-row">
            <h1 id="landing-page-soundscape-title">Soundscape</h1>
          </div>
          <div className="flex-row">
            <span>This application uses audio.</span>
          </div>
          <div className="flex-row">
            {isMobile ? (
              <span id="choose-a-song">Choose a song to begin.</span>
            ) : (
              <>
                <span
                  id={
                    selected.name ? "landing-page-song-title" : "choose-a-song"
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
          </div>
          {isMobile ? (
            <LandingPageMobile dispatch={dispatch} />
          ) : (
            <div id="song-selection-panel">
              <Link className="song-link" to="/play/swamp">
                <SwampIcon name="swamp" dispatch={dispatch} />
              </Link>
              <Link className="song-link" to="/play/mornings">
                <MorningsIcon name="mornings" dispatch={dispatch} />
              </Link>
              <Link className="song-link" to="/play/moonrise">
                <MoonriseIcon name="moonrise" dispatch={dispatch} />
              </Link>
              <Link className="song-link" to="/info">
                <ComingSoonIcon name="coming-soon" dispatch={dispatch} />
              </Link>
            </div>
          )}
        </div>
      </div>
      {/* <div className="announcement hot-green">
        <span>
          New! &nbsp;
          <a
            href="https://discord.gg/7u7e4ZbeQk"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join the Soundscape Discord
          </a>
        </span>
      </div> */}
    </>
  );
};
