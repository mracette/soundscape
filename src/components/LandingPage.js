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

import { Route, Switch, Redirect } from "react-router-dom";

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

  const canvasRef = React.useRef(null);

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
          <Switch>
            <Route exact path="/">
              <LandingPageInner />
            </Route>
            <Route exact path="/info">
              <InfoPageInner />
            </Route>
            <Redirect to="/" />
          </Switch>
        </div>
      </div>
    </>
  );
};

function InfoPageInner() {
  return (
    <div className="flex-col" style={{ alignItems: "center" }}>
      <h3 className="info-subheader">
        The immersive music visualizer that lets you build your own beats
      </h3>
      <div className="info-row">
        <p>Join Discord to hear about new content</p>
        <a
          href="https://discord.gg/7u7e4ZbeQk"
          target="_blank"
          rel="noreferrer"
        >
          <button role="link" className="info-page-button button-white">
            Join the Discord
          </button>
        </a>
      </div>
      <div className="info-row">
        <p>You can find the source code for Soundscape on Github</p>
        <a
          href="https://github.com/mracette/soundscape"
          target="_blank"
          rel="noreferrer"
        >
          <button role="link" className="info-page-button button-white">
            View the source
          </button>
        </a>
      </div>
      <div className="info-row">
        <p>For questions or comments, send an email</p>
        <a
          href="mailto:markracette+soundscape@gmail.com"
          target="_blank"
          rel="noreferrer"
        >
          <button role="link" className="info-page-button button-white">
            Send an email
          </button>
        </a>
      </div>
    </div>
  );
}

function LandingPageInner() {
  const { isMobile } = React.useContext(LayoutContext);
  const [selected, dispatch] = React.useReducer(landingPageReducer, {
    name: null,
    bpm: null,
    key: null,
  });
  return (
    <>
      <div className="flex-row">
        <span>This application uses audio.</span>
      </div>
      <div className="flex-row">
        {isMobile ? (
          <span id="choose-a-song">Choose a song to begin.</span>
        ) : (
          <>
            <span
              id={selected.name ? "landing-page-song-title" : "choose-a-song"}
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
    </>
  );
}
