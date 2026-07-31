import { useRef, useEffect } from "react";
import {
  landingPageCanvas,
  landingPage,
  landingPageHeader,
  landingPageTitleWrapper,
  landingPageTitle,
  innerLandingPage,
} from "../styles/components/LandingPage.css";
import { cx } from "../utils/cx";
import { addWindowListeners, removeWindowListeners } from "../utils/jsUtils";
import { LandingPageScene } from "../viz/scenes/landing/LandingPageScene";
import { LoadingIcon } from "./custom-song-icons/LoadingIcon";
import { SongCards } from "./SongCards";
import { InfoPage } from "./InfoPage";

import { Route, Switch, Redirect } from "wouter";

/**
 * The app's entry shell. Everything before a song is playing — the picker, the
 * info page, and the loading state a song passes through — is a route inside
 * this one component, so the sky scene behind them is built once and survives
 * every transition. AppRouter keeps it mounted through `/play` until the
 * player reports ready; it sits above the mounting player on the way there.
 */
export const LandingPage = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let scene: LandingPageScene | undefined;

    if (canvasRef.current) {
      scene = new LandingPageScene(canvasRef.current);
      addWindowListeners(scene.onWindowResize);
    }

    return () => {
      if (!scene) return;
      scene.dispose();
      removeWindowListeners(scene.onWindowResize);
    };
  }, []);

  return (
    <div className={cx("fullscreen", "front-most", "off-black")}>
      <canvas
        id="landing-page-canvas"
        className={cx(landingPageCanvas, "fullscreen")}
        ref={canvasRef}
      />
      <div
        id="landing-page"
        className={cx(landingPage, "transparent")}
      >
        <div className={landingPageHeader}>
          <div
            className={cx("flex-row", landingPageTitleWrapper)}
            id="landing-page-soundscape-title-wrapper"
          >
            <h1 id="landing-page-soundscape-title" className={landingPageTitle}>
              Soundscape
            </h1>
          </div>
          <Switch>
            <Route path="/">
              <LandingPageInner />
            </Route>
            <Route path="/info">
              <InfoPage />
            </Route>
            <Route path="/play/:songId">
              <LandingPageLoading />
            </Route>
            <Route>
              <Redirect to="/" replace />
            </Route>
          </Switch>
        </div>
      </div>
    </div>
  );
};

function LandingPageInner() {
  return (
    <div className={cx(innerLandingPage)}>
      <p>This application uses audio. Choose a song to begin. </p>
      <SongCards />
    </div>
  );
}

function LandingPageLoading() {
  return (
    // "loading-screen" is a test hook selected by e2e/helpers.js
    <div id="loading-screen" className={cx(innerLandingPage)}>
      <p>Loading...</p>
      <LoadingIcon />
    </div>
  );
}
