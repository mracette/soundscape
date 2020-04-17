// libs
import React from "react";

// components
import { LoadingIcon } from "../components/custom-song-icons/LoadingIcon";

// contexts
import { MusicPlayerContext } from "../contexts/contexts";

// styles
import "../styles/components/LandingPage.scss";

export const LoadingScreen = () => {
  const { isLoading } = React.useContext(MusicPlayerContext);

  return (
    <div id="loading-screen" className="front-most off-black fullscreen">
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
