import { ThemeContext, type ThemeContextValue } from "../../contexts/contexts";
import { MenuButtonParent } from "../../components/menu-button/MenuButtonParent";
import * as styles from "./MenuStory.css";

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
