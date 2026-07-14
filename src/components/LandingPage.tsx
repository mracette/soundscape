import { useRef, useEffect } from "react";
import {
  landingPageCanvas,
  landingPage,
  landingPageHeader,
  landingPageTitleWrapper,
  landingPageTitle,
  landingPageTitleHero,
  landingPageTitleSpill,
  innerLandingPage,
} from "../styles/components/LandingPage.css";
import { cx } from "../utils/cx";
import { addWindowListeners, removeWindowListeners } from "../utils/jsUtils";
import { LandingPageScene } from "../viz/scenes/landing/LandingPageScene";
import { SongCards } from "./SongCards";
import { InfoPage } from "./InfoPage";

import { Route, Switch, Redirect } from "wouter";

export const LandingPage = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let scene: LandingPageScene | undefined;

    if (canvasRef.current) {
      scene = new LandingPageScene(canvasRef.current);
      addWindowListeners(scene.onWindowResize);
    }

    return () => {
      scene!.stop();
      scene!.disposeAll(scene!.scene);
      removeWindowListeners(scene!.onWindowResize);
    };
  }, []);

  return (
    <>
      <canvas
        id="landing-page-canvas"
        className={cx(landingPageCanvas, "fullscreen")}
        ref={canvasRef}
      />
      <div
        id="landing-page"
        className={cx(landingPage, "fullscreen", "transparent")}
      >
        <div className={landingPageHeader}>
          <div
            className={cx("flex-row", landingPageTitleWrapper)}
            id="landing-page-soundscape-title-wrapper"
          >
            <div className={landingPageTitleHero}>
              <img
                src="/img/hero-spill.webp"
                alt=""
                className={landingPageTitleSpill}
              />
              <h1
                id="landing-page-soundscape-title"
                className={landingPageTitle}
              >
                Soundscape
              </h1>
            </div>
          </div>
          <Switch>
            <Route path="/">
              <LandingPageInner />
            </Route>
            <Route path="/info">
              <InfoPage />
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

function LandingPageInner() {
  return (
    <div className={cx(innerLandingPage)}>
      <p>This application uses audio. Choose a song to begin. </p>
      <SongCards />
    </div>
  );
}
