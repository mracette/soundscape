import { SwampIcon } from "../../components/custom-song-icons/SwampIcon";
import { MorningsIcon } from "../../components/custom-song-icons/MorningsIcon";
import { MoonriseIcon } from "../../components/custom-song-icons/MoonriseIcon";
import { ComingSoonIcon } from "../../components/custom-song-icons/ComingSoonIcon";

const noop = () => {};

export const SongIconsStory = () => (
  <div id="song-selection-panel">
    <div className="song-link">
      <SwampIcon name="swamp" dispatch={noop} />
    </div>
    <div className="song-link">
      <MorningsIcon name="mornings" dispatch={noop} />
    </div>
    <div className="song-link">
      <MoonriseIcon name="moonrise" dispatch={noop} />
    </div>
    <div className="song-link">
      <ComingSoonIcon name="coming-soon" dispatch={noop} />
    </div>
  </div>
);
