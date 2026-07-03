import { useRef, useEffect, useContext, useState } from "react";
import { Link } from "wouter";
import { MoonriseIcon } from "./custom-song-icons/MoonriseIcon";
import { MorningsIcon } from "./custom-song-icons/MorningsIcon";
import { SwampIcon } from "./custom-song-icons/SwampIcon";
import { ComingSoonIcon } from "./custom-song-icons/ComingSoonIcon";
import { LayoutContext } from "../contexts/contexts";
import {
  landingPageCanvas,
  landingPage,
  landingPageHeader,
  landingPageTitleWrapper,
  landingPageTitle,
  landingPageSongTitle,
  landingPageBpm,
  landingPageKey,
  songSelectionPanel,
  songLink,
  infoSubheader,
  infoRow,
  infoPageButton,
} from "../styles/components/LandingPage.css";
import { pillButton, pillButtonAccent } from "../styles/shared/buttons.css";
import { cx } from "../utils/cx";
import { isWeb } from "../utils/runtime";
import { addWindowListeners, removeWindowListeners } from "../utils/jsUtils";
import { LandingPageScene } from "../viz/scenes/landing/LandingPageScene";
import { LandingPageMobile } from "./LandingPageMobile";

import { Route, Switch, Redirect } from "wouter";

type Selected = { name: string | null; bpm: string | null; key: string | null };

const NONE: Selected = { name: null, bpm: null, key: null };

const SONGS: Record<string, Selected> = {
  moonrise: { name: "Moonrise", bpm: "120", key: "G Minor" },
  mornings: { name: "Mornings", bpm: "92", key: "Eb Major" },
  swamp: { name: "Swamp", bpm: "75", key: "Eb Minor" },
  "coming-soon": { name: "Information & Updates", bpm: null, key: null },
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
      <canvas id="landing-page-canvas" className={cx(landingPageCanvas, "fullscreen")} ref={canvasRef} />
      <div id="landing-page" className={cx(landingPage, "fullscreen", "transparent")}>
        <div className={landingPageHeader}>
          <div className={cx("flex-row", landingPageTitleWrapper)} id="landing-page-soundscape-title-wrapper">
            <h1 id="landing-page-soundscape-title" className={landingPageTitle}>Soundscape</h1>
          </div>
          <Switch>
            <Route path="/">
              <LandingPageInner />
            </Route>
            <Route path="/info">
              <InfoPageInner />
            </Route>
            <Route>
              <Redirect to="/" replace />
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
      {!isWeb && (
        <Link href="/">
          <button className={cx(infoPageButton, pillButton, pillButtonAccent.info)}>← Back</button>
        </Link>
      )}
      <h3 className={cx(infoSubheader, "info-subheader")}>
        The immersive music visualizer that lets you build your own beats
      </h3>
      <div className={infoRow}>
        <p>Join the Discord for updates on new content</p>
        <a
          href="https://discord.gg/7u7e4ZbeQk"
          target="_blank"
          rel="noreferrer"
        >
          <button role="link" className={cx(infoPageButton, pillButton, pillButtonAccent.info)}>
            Join the Discord
          </button>
        </a>
      </div>
      <div className={infoRow}>
        <p>View the source code for Soundscape</p>
        <a
          href="https://github.com/mracette/soundscape"
          target="_blank"
          rel="noreferrer"
        >
          <button role="link" className={cx(infoPageButton, pillButton, pillButtonAccent.info)}>
            View the source
          </button>
        </a>
      </div>
      <div className={infoRow}>
        <p>Questions or comments?</p>
        <a
          href="mailto:markracette+soundscape@gmail.com"
          target="_blank"
          rel="noreferrer"
        >
          <button role="link" className={cx(infoPageButton, pillButton, pillButtonAccent.info)}>
            Send an email
          </button>
        </a>
      </div>
    </div>
  );
}

function LandingPageInner() {
  const { isMobile } = useContext(LayoutContext)!;
  const [selected, setSelected] = useState<Selected>(NONE);
  const select = (id: string | null) => setSelected(id ? SONGS[id] ?? NONE : NONE);
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
              className={cx(selected.name && landingPageSongTitle)}
            >
              {selected.name || "Choose a song to begin"}
            </span>
            {selected.bpm && (
              <>
                <span>&nbsp;|&nbsp;</span>{" "}
                <span id="landing-page-bpm" className={landingPageBpm}>{` ${selected.bpm} bpm`}</span>
              </>
            )}
            {selected.key && (
              <>
                <span>&nbsp;|&nbsp;</span>{" "}
                <span id="landing-page-key" className={landingPageKey}>{selected.key}</span>
              </>
            )}
          </>
        )}
      </div>
      {isMobile ? (
        <LandingPageMobile onSelect={select} />
      ) : (
        <div id="song-selection-panel" className={songSelectionPanel}>
          <Link className={cx(songLink, "song-link")} href="/play/swamp">
            <SwampIcon name="swamp" onSelect={select} />
          </Link>
          <Link className={cx(songLink, "song-link")} href="/play/mornings">
            <MorningsIcon name="mornings" onSelect={select} />
          </Link>
          <Link className={cx(songLink, "song-link")} href="/play/moonrise">
            <MoonriseIcon name="moonrise" onSelect={select} />
          </Link>
          <Link className={cx(songLink, "song-link")} href="/info">
            <ComingSoonIcon name="coming-soon" onSelect={select} />
          </Link>
        </div>
      )}
    </>
  );
}
