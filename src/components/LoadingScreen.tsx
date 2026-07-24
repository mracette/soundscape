import { LoadingIcon } from "../components/custom-song-icons/LoadingIcon";
import {
  landingPageHeader,
  landingPageTitle,
  landingPageTitleArt,
} from "../styles/components/LandingPage.css";

export const LoadingScreen = () => {
  return (
    <div
      id="loading-screen"
      className="front-most off-black fullscreen"
      style={{ paddingTop: "10rem" }}
    >
      <div className={landingPageHeader}>
        <div className="flex-row">
          <h1 id="landing-page-soundscape-title" className={landingPageTitle}>
            <img
              src="/img/hero-title.webp"
              alt="Soundscape"
              className={landingPageTitleArt}
            />
          </h1>
        </div>
        <div className="flex-row">
          <span>Loading...</span>
        </div>
        <LoadingIcon />
      </div>
    </div>
  );
};
