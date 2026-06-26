import { SwampIcon } from "../../components/custom-song-icons/SwampIcon";
import { MorningsIcon } from "../../components/custom-song-icons/MorningsIcon";
import { MoonriseIcon } from "../../components/custom-song-icons/MoonriseIcon";
import { ComingSoonIcon } from "../../components/custom-song-icons/ComingSoonIcon";
import {
  songSelectionPanel,
  songLink,
} from "../../styles/components/LandingPage.css";

const noop = () => {};

export const SongIconsStory = () => (
  <div className={songSelectionPanel}>
    <div className={songLink}>
      <SwampIcon name="swamp" dispatch={noop} />
    </div>
    <div className={songLink}>
      <MorningsIcon name="mornings" dispatch={noop} />
    </div>
    <div className={songLink}>
      <MoonriseIcon name="moonrise" dispatch={noop} />
    </div>
    <div className={songLink}>
      <ComingSoonIcon name="coming-soon" dispatch={noop} />
    </div>
  </div>
);
