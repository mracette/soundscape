import React from "react";
import { MoonriseIcon } from "./custom-song-icons/MoonriseIcon";
import { MorningsIcon } from "./custom-song-icons/MorningsIcon";
import { SwampIcon } from "./custom-song-icons/SwampIcon";
import { ComingSoonIcon } from "./custom-song-icons/ComingSoonIcon";
import { Link } from "react-router-dom";

import "../styles/components/LandingPage.scss";

export const LandingPageMobile = ({ dispatch }) => {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Link to="/play/swamp" className="song-link-mobile">
        <div className="flex-row" style={{ justifyContent: "flex-start" }}>
          <SwampIcon name="swamp" dispatch={dispatch} />
          <div>
            <span>Swamp</span>
            <div>
              <span>75 bpm</span>&nbsp;|&nbsp;
              <span>Eb Minor</span>
            </div>
          </div>
        </div>
      </Link>
      <Link to="/play/mornings" className="song-link-mobile">
        <div className="flex-row" style={{ justifyContent: "flex-start" }}>
          <MorningsIcon name="mornings" dispatch={dispatch} />
          <div>
            <span>Mornings</span>
            <div>
              <span>92 bpm</span>&nbsp;|&nbsp;
              <span>Eb Major</span>
            </div>
          </div>
        </div>
      </Link>
      <Link to="/play/moonrise" className="song-link-mobile">
        <div className="flex-row" style={{ justifyContent: "flex-start" }}>
          <MoonriseIcon name="moonrise" dispatch={dispatch} />
          <div>
            <span>Moonrise</span>
            <div>
              <span>120 bpm</span>&nbsp;|&nbsp;
              <span>G Minor</span>
            </div>
          </div>
        </div>
      </Link>
      <Link to="/info" className="song-link-mobile">
        <div className="flex-row" style={{ justifyContent: "flex-start" }}>
          <div>
            <ComingSoonIcon name="coming-soon" dispatch={dispatch} />
          </div>
          <div>
            <span>Information & Updates</span>
          </div>
        </div>
      </Link>
    </div>
  );
};
