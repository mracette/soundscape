import { MoonriseIcon } from "./custom-song-icons/MoonriseIcon";
import { MorningsIcon } from "./custom-song-icons/MorningsIcon";
import { SwampIcon } from "./custom-song-icons/SwampIcon";
import { ComingSoonIcon } from "./custom-song-icons/ComingSoonIcon";
import { Link } from "wouter";

import { songLinkMobile } from "../styles/components/LandingPage.css";

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
      <Link href="/play/swamp" className={songLinkMobile}>
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
      <Link href="/play/mornings" className={songLinkMobile}>
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
      <Link href="/play/moonrise" className={songLinkMobile}>
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
      <Link href="/info" className={songLinkMobile}>
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
