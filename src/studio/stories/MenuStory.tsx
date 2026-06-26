import { ThemeContext, type ThemeContextValue } from "../../contexts/contexts";
import { MenuButtonParent } from "../../components/menu-button/MenuButtonParent";
import * as styles from "./MenuStory.css";

// Mirrors the swamp song theme so the menu reads like it does in the app
// (dark button, white icon, translucent-white when open) rather than with
// arbitrary demo colors.
const mockTheme: ThemeContextValue = {
  id: "studio",
  spectrumFunction: () => "#ffffff",
  canvasFade: false,
  resizeType: "",
  buttonColor: "rgba(31, 38, 47, 1)",
  openButtonColor: "rgba(255, 255, 255, 0.15)",
  contentPanelColor: "rgba(31, 38, 47, 0.65)",
  panelResetButton: "",
  panelRandomizeButton: "",
  panelMuteButton: "",
  groupSoloButton: "",
  groupMuteButton: "",
};

export const MenuStory = () => (
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
            id: "music",
            iconName: "icon-music",
            content: (
              <div className="flex-panel">
                <h2>Music</h2>
              </div>
            ),
          },
        ]}
      />
    </div>
  </ThemeContext.Provider>
);
