import { useState, type ComponentType } from "react";
import { SwampIcon } from "../components/custom-song-icons/SwampIcon";
import { MorningsIcon } from "../components/custom-song-icons/MorningsIcon";
import { MoonriseIcon } from "../components/custom-song-icons/MoonriseIcon";
import { ComingSoonIcon } from "../components/custom-song-icons/ComingSoonIcon";
import { LoadingIcon } from "../components/custom-song-icons/LoadingIcon";
import * as styles from "./studio.css";

export interface Story {
  id: string;
  title: string;
  group: string;
  Component: ComponentType;
}

const noop = () => {};

const SwampStory = () => <SwampIcon name="swamp" dispatch={noop} />;
const MorningsStory = () => <MorningsIcon name="mornings" dispatch={noop} />;
const MoonriseStory = () => <MoonriseIcon name="moonrise" dispatch={noop} />;
const ComingSoonStory = () => <ComingSoonIcon name="coming-soon" dispatch={noop} />;

const LoadingStory = () => {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ textAlign: "center" }}>
      <LoadingIcon isLoading={loading} />
      <button
        className={styles.controlButton}
        onClick={() => setLoading((v) => !v)}
      >
        {loading ? "Set ready" : "Set loading"}
      </button>
    </div>
  );
};

export const stories: Story[] = [
  { id: "swamp", title: "Swamp Icon", group: "Song Icons", Component: SwampStory },
  { id: "mornings", title: "Mornings Icon", group: "Song Icons", Component: MorningsStory },
  { id: "moonrise", title: "Moonrise Icon", group: "Song Icons", Component: MoonriseStory },
  { id: "coming-soon", title: "Coming Soon Icon", group: "Song Icons", Component: ComingSoonStory },
  { id: "loading", title: "Loading Icon", group: "Song Icons", Component: LoadingStory },
];
