import { MoonriseIcon } from "./custom-song-icons/MoonriseIcon";
import { MorningsIcon } from "./custom-song-icons/MorningsIcon";
import { SwampIcon } from "./custom-song-icons/SwampIcon";
import { ComingSoonIcon } from "./custom-song-icons/ComingSoonIcon";
import { Link } from "wouter";

import {
  songLinkGlow,
  songLinkMobile,
} from "../styles/components/LandingPage.css";
import { cx } from "../utils/cx";

interface Props {
  onSelect: (id: string | null) => void;
}

export const LandingPageMobile = ({ onSelect }: Props) => {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Link
        href="/play/swamp"
        className={cx(songLinkMobile, songLinkGlow.swamp)}
      >
        <div className="flex-row" style={{ justifyContent: "flex-start" }}>
          <SwampIcon name="swamp" onSelect={onSelect} />
          <div>
            <span>Swamp</span>
            <div>
              <span>75 bpm</span>&nbsp;|&nbsp;
              <span>Eb Minor</span>
            </div>
          </div>
        </div>
      </Link>
      <Link
        href="/play/mornings"
        className={cx(songLinkMobile, songLinkGlow.mornings)}
      >
        <div className="flex-row" style={{ justifyContent: "flex-start" }}>
          <MorningsIcon name="mornings" onSelect={onSelect} />
          <div>
            <span>Mornings</span>
            <div>
              <span>92 bpm</span>&nbsp;|&nbsp;
              <span>Eb Major</span>
            </div>
          </div>
        </div>
      </Link>
      <Link
        href="/play/moonrise"
        className={cx(songLinkMobile, songLinkGlow.moonrise)}
      >
        <div className="flex-row" style={{ justifyContent: "flex-start" }}>
          <MoonriseIcon name="moonrise" onSelect={onSelect} />
          <div>
            <span>Moonrise</span>
            <div>
              <span>120 bpm</span>&nbsp;|&nbsp;
              <span>G Minor</span>
            </div>
          </div>
        </div>
      </Link>
      <Link
        href="/info"
        className={cx(songLinkMobile, songLinkGlow["coming-soon"])}
      >
        <div className="flex-row" style={{ justifyContent: "flex-start" }}>
          <div>
            <ComingSoonIcon name="coming-soon" onSelect={onSelect} />
          </div>
          <div>
            <span>Information & Updates</span>
          </div>
        </div>
      </Link>
    </div>
  );
};
