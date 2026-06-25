import { useRef, useEffect, useContext, useReducer } from "react";
import { Link } from "wouter";
import { MoonriseIcon } from "./custom-song-icons/MoonriseIcon";
import { MorningsIcon } from "./custom-song-icons/MorningsIcon";
import { SwampIcon } from "./custom-song-icons/SwampIcon";
import { ComingSoonIcon } from "./custom-song-icons/ComingSoonIcon";
import { LayoutContext } from "../contexts/contexts";
import "../styles/components/LandingPage.css";
import { buttonWhite } from "../styles/shared/buttons.css";
import { cx } from "../utils/cx";
import { addWindowListeners, removeWindowListeners } from "../utils/jsUtils";
import { LandingPageScene } from "../viz/scenes/landing/LandingPageScene";
import { LandingPageMobile } from "./LandingPageMobile";

import { Route, Switch, Redirect } from "wouter";

type State = { name: string | null; bpm: string | null; key: string | null };
type Action = { type: string | null };

export const landingPageReducer = (state: State, action: Action): State => {
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

interface LandingPageProps {
  spectrumFunction: (n: number) => unknown;
}

export const LandingPage = (props: LandingPageProps) => {
  const { spectrumFunction } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let scene: LandingPageScene | undefined;

    if (canvasRef.current) {
      scene = new LandingPageScene(canvasRef.current, {
        spectrumFunction: spectrumFunction as (n: number) => string,
      });
      addWindowListeners(scene.onWindowResize);
    }

    return () => {
      scene!.stop();
      scene!.disposeAll(scene!.scene);
      removeWindowListeners(scene!.onWindowResize);
    };
  }, [spectrumFunction]);

  return (
    <>
      <canvas id="landing-page-canvas" className="fullscreen" ref={canvasRef} />
      <div id="landing-page" className="fullscreen transparent">
        <div className="landing-page-header">
          <div className="flex-row" id="landing-page-soundscape-title-wrapper">
            <h1 id="landing-page-soundscape-title">Soundscape</h1>
          </div>
          <Switch>
            <Route path="/">
              <LandingPageInner />
            </Route>
            <Route path="/info">
              <InfoPageInner />
            </Route>
            <Route>
              <Redirect to="/" />
            </Route>
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
        <p>Join the Discord for updates on new content</p>
        <a
          href="https://discord.gg/7u7e4ZbeQk"
          target="_blank"
          rel="noreferrer"
        >
          <button role="link" className={cx("info-page-button", buttonWhite)}>
            Join the Discord
          </button>
        </a>
      </div>
      <div className="info-row">
        <p>View the source code for Soundscape</p>
        <a
          href="https://github.com/mracette/soundscape"
          target="_blank"
          rel="noreferrer"
        >
          <button role="link" className={cx("info-page-button", buttonWhite)}>
            View the source
          </button>
        </a>
      </div>
      <div className="info-row">
        <p>Questions or comments?</p>
        <a
          href="mailto:markracette+soundscape@gmail.com"
          target="_blank"
          rel="noreferrer"
        >
          <button role="link" className={cx("info-page-button", buttonWhite)}>
            Send an email
          </button>
        </a>
      </div>
    </div>
  );
}

function LandingPageInner() {
  const { isMobile } = useContext(LayoutContext)!;
  const [selected, dispatch] = useReducer(landingPageReducer, {
    name: null,
    bpm: null,
    key: null,
  });
  return (
    <>
      <div className="flex-row">
        <span>This application uses audio</span>
      </div>
      <div className="flex-row">
        {isMobile ? (
          <span id="choose-a-song">Choose a song to begin</span>
        ) : (
          <>
            <span
              id={selected.name ? "landing-page-song-title" : "choose-a-song"}
            >
              {selected.name || "Choose a song to begin"}
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
          <Link className="song-link" href="/play/swamp">
            <SwampIcon name="swamp" dispatch={dispatch} />
          </Link>
          <Link className="song-link" href="/play/mornings">
            <MorningsIcon name="mornings" dispatch={dispatch} />
          </Link>
          <Link className="song-link" href="/play/moonrise">
            <MoonriseIcon name="moonrise" dispatch={dispatch} />
          </Link>
          <Link className="song-link" href="/info">
            <ComingSoonIcon name="coming-soon" dispatch={dispatch} />
          </Link>
        </div>
      )}
    </>
  );
}
