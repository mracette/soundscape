// components
import { LoadingIcon } from "../components/custom-song-icons/LoadingIcon";

// store
import { useMusicPlayerStore } from "../stores/musicPlayerStore";

// styles
import "../styles/components/LandingPage.css";

export const LoadingScreen = () => {
  const isLoading = useMusicPlayerStore((s) => s.isLoading);

  return (
    <div
      id="loading-screen"
      className="front-most off-black fullscreen"
      style={{ paddingTop: "10rem" }}
    >
      <div className="landing-page-header">
        <div className="flex-row">
          <h1 id="landing-page-soundscape-title">Soundscape</h1>
        </div>
        <div className="flex-row">
          <span>Loading...</span>
        </div>
        <LoadingIcon isLoading={isLoading} />
      </div>
    </div>
  );
};
