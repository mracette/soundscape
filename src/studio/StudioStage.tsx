import type { Story } from "./stories";
import * as styles from "./studio.css";

interface Props {
  story: Story;
  light: boolean;
  onToggleLight: () => void;
}

export const StudioStage = ({ story, light, onToggleLight }: Props) => {
  const Component = story.Component;
  return (
    <main className={styles.stage}>
      <div className={styles.stageControls}>
        <span>{story.title}</span>
        <button className={styles.controlButton} onClick={onToggleLight}>
          {light ? "Dark bg" : "Light bg"}
        </button>
      </div>
      <div
        className={`${styles.stageCanvas} ${light ? styles.stageCanvasLight : ""}`}
      >
        <Component />
      </div>
    </main>
  );
};
