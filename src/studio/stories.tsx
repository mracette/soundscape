import { useState, useRef, type ComponentType } from "react";
import { ThemeContext, type ThemeContextValue } from "../contexts/contexts";
import {
  ToggleButtonView,
  type ToggleButtonViewHandle,
} from "../components/toggle-button/ToggleButtonView";
import { MenuButtonParent } from "../components/menu-button/MenuButtonParent";
import { SwampIcon } from "../components/custom-song-icons/SwampIcon";
import { MorningsIcon } from "../components/custom-song-icons/MorningsIcon";
import { MoonriseIcon } from "../components/custom-song-icons/MoonriseIcon";
import { ComingSoonIcon } from "../components/custom-song-icons/ComingSoonIcon";
import { LoadingIcon } from "../components/custom-song-icons/LoadingIcon";
import * as styles from "./studio.css";
import { Icon } from "../components/Icon";
import { SocialIcons } from "../components/iconography/SocialIcons";
import { SharingIcons } from "../components/iconography/SharingIcons";

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
    <div className={styles.loadingStory}>
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

const ToggleStory = () => {
  const viewRef = useRef<ToggleButtonViewHandle>(null);
  const [active, setActive] = useState(false);
  return (
    <ToggleButtonView
      ref={viewRef}
      active={active}
      onClick={() => {
        const next = !active;
        setActive(next);
        viewRef.current?.runAnimation(next ? "start" : "stop", 600);
      }}
    />
  );
};

const mockTheme: ThemeContextValue = {
  id: "studio",
  spectrumFunction: () => "#ffffff",
  canvasFade: false,
  resizeType: "",
  buttonColor: "rgba(255, 76, 122, 0.9)",
  openButtonColor: "rgba(0, 225, 158, 0.9)",
  contentPanelColor: "rgba(20, 27, 36, 0.95)",
  panelResetButton: "",
  panelRandomizeButton: "",
  panelMuteButton: "",
  groupSoloButton: "",
  groupMuteButton: "",
};

const MenuStory = () => (
  <ThemeContext.Provider value={mockTheme}>
    <div className={styles.menuStage}>
      <MenuButtonParent
        childButtonProps={[
          {
            id: "home",
            iconName: "icon-home",
            content: (
              <div className="flex-panel">
                <h2>Home</h2>
              </div>
            ),
          },
          {
            id: "info",
            iconName: "icon-info",
            content: (
              <div className="flex-panel">
                <h2>Info</h2>
              </div>
            ),
          },
          {
            id: "list",
            iconName: "icon-list",
            content: (
              <div className="flex-panel">
                <h2>List</h2>
              </div>
            ),
          },
        ]}
      />
    </div>
  </ThemeContext.Provider>
);

const ICON_NAMES = [
  "icon-envelope", "icon-equalizer", "icon-github", "icon-headphones",
  "icon-home", "icon-info", "icon-instagram", "icon-list", "icon-make-group",
  "icon-menu", "icon-music", "icon-pause", "icon-pause2", "icon-play2",
  "icon-play3", "icon-plus", "icon-spotify", "icon-stop", "icon-stop2",
  "icon-twitter", "icon-volume-high", "icon-volume-low", "icon-volume-medium",
  "icon-volume-mute", "icon-volume-mute2",
];

const IconGalleryStory = () => (
  <div className={styles.galleryWrap}>
    <div className={styles.iconGrid}>
      {ICON_NAMES.map((name) => (
        <div key={name} className={styles.iconCell}>
          <Icon
            divClassList={styles.iconCellSvg}
            svgClassList="icon icon-white"
            name={name}
          />
          <span>{name}</span>
        </div>
      ))}
    </div>
    <div className={styles.iconSection}>Social Icons</div>
    <SocialIcons />
    <div className={styles.iconSection}>Sharing Icons</div>
    <SharingIcons />
  </div>
);

export const stories: Story[] = [
  { id: "swamp", title: "Swamp Icon", group: "Song Icons", Component: SwampStory },
  { id: "mornings", title: "Mornings Icon", group: "Song Icons", Component: MorningsStory },
  { id: "moonrise", title: "Moonrise Icon", group: "Song Icons", Component: MoonriseStory },
  { id: "coming-soon", title: "Coming Soon Icon", group: "Song Icons", Component: ComingSoonStory },
  { id: "loading", title: "Loading Icon", group: "Song Icons", Component: LoadingStory },
  { id: "toggle", title: "Toggle Button", group: "Buttons", Component: ToggleStory },
  { id: "menu", title: "Menu Button", group: "Buttons", Component: MenuStory },
  { id: "icons", title: "Icon Gallery", group: "Misc", Component: IconGalleryStory },
];
