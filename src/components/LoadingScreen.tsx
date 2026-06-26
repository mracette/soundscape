import { LoadingIcon } from "../components/custom-song-icons/LoadingIcon";
import { useMusicPlayerStore } from "../stores/musicPlayerStore";
import {
  landingPageHeader,
  landingPageTitle,
} from "../styles/components/LandingPage.css";

export const LoadingScreen = () => {
  const isLoading = useMusicPlayerStore((s) => s.isLoading);

  return (
    <div
      id="loading-screen"
      className="front-most off-black fullscreen"
      style={{ paddingTop: "10rem" }}
    >
      <div className={landingPageHeader}>
        <div className="flex-row">
          <h1 id="landing-page-soundscape-title" className={landingPageTitle}>Soundscape</h1>
        </div>
        <div className="flex-row">
          <span>Loading...</span>
        </div>
        <LoadingIcon isLoading={isLoading} />
      </div>
    </div>
  );
};
