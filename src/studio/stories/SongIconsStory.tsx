import { SwampIcon } from "../../components/custom-song-icons/SwampIcon";
import { MorningsIcon } from "../../components/custom-song-icons/MorningsIcon";
import { MoonriseIcon } from "../../components/custom-song-icons/MoonriseIcon";
import { ComingSoonIcon } from "../../components/custom-song-icons/ComingSoonIcon";
import {
  songCard,
  songCardList,
} from "../../styles/components/LandingPage.css";

export const SongIconsStory = () => (
  <div className={songCardList}>
    <div className={songCard}>
      <SwampIcon name="swamp" />
    </div>
    <div className={songCard}>
      <MorningsIcon name="mornings" />
    </div>
    <div className={songCard}>
      <MoonriseIcon name="moonrise" />
    </div>
    <div className={songCard}>
      <ComingSoonIcon name="coming-soon" />
    </div>
  </div>
);
