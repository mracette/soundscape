import type { Story } from "./stories";
import * as styles from "./StudioStage.css";

interface Props {
  story: Story;
}

export const StudioStage = ({ story }: Props) => {
  const Component = story.Component;
  return (
    <main className={styles.stage}>
      <div className={styles.stageControls}>
        <span>{story.title}</span>
      </div>
      <div className={styles.stageCanvas}>
        <Component />
      </div>
    </main>
  );
};
