import { Link } from "wouter";
import { MoonriseIcon } from "./custom-song-icons/MoonriseIcon";
import { MorningsIcon } from "./custom-song-icons/MorningsIcon";
import { SwampIcon } from "./custom-song-icons/SwampIcon";
import { ComingSoonIcon } from "./custom-song-icons/ComingSoonIcon";
import {
  songCard,
  songCardList,
  songCardName,
} from "../styles/components/LandingPage.css";
import { cx } from "../utils/cx";

const SONGS = [
  { href: "/play/swamp", name: "Swamp", bpm: "75 bpm", songKey: "Eb Minor", Icon: SwampIcon, iconName: "swamp" },
  { href: "/play/mornings", name: "Mornings", bpm: "92 bpm", songKey: "Eb Major", Icon: MorningsIcon, iconName: "mornings" },
  { href: "/play/moonrise", name: "Moonrise", bpm: "120 bpm", songKey: "G Minor", Icon: MoonriseIcon, iconName: "moonrise" },
];

export const SongCards = () => (
  <div id="song-selection-panel" className={songCardList}>
    {/* "song-link" is a test hook selected by e2e/routing.spec.js */}
    {SONGS.map(({ href, name, bpm, songKey, Icon, iconName }) => (
      <Link key={href} href={href} className={cx(songCard, "song-link")}>
        <div className="flex-row" style={{ justifyContent: "flex-start" }}>
          <Icon name={iconName} />
          <div>
            <span className={songCardName}>{name}</span>
            <div>
              <span>{bpm}</span>&nbsp;|&nbsp;
              <span>{songKey}</span>
            </div>
          </div>
        </div>
      </Link>
    ))}
    <Link href="/info" className={songCard}>
      <div className="flex-row" style={{ justifyContent: "flex-start" }}>
        <ComingSoonIcon name="coming-soon" />
        <div>
          <span className={songCardName}>Information & Updates</span>
        </div>
      </div>
    </Link>
  </div>
);
