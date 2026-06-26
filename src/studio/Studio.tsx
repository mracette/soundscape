import { StudioSidebar } from "./StudioSidebar";
import { StudioStage } from "./StudioStage";
import { stories } from "./stories";
import * as styles from "./Studio.css";

interface Props {
  storyId?: string;
}

export const Studio = ({ storyId }: Props) => {
  const active = stories.find((s) => s.id === storyId) ?? stories[0];

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>Soundscape Studio</h1>
      </header>
      <div className={styles.body}>
        <StudioSidebar activeId={active.id} />
        <StudioStage story={active} />
      </div>
    </div>
  );
};
