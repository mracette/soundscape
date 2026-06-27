import { Redirect } from "wouter";
import { StudioSidebar } from "./StudioSidebar";
import { StudioStage } from "./StudioStage";
import { stories } from "./stories";
import * as styles from "./Studio.css";

interface Props {
  storyId?: string;
}

export const Studio = ({ storyId }: Props) => {
  const active = stories.find((s) => s.id === storyId);

  // Bare /studio or an unknown story id resolves to the default story's URL so
  // the path and the highlighted sidebar entry always agree.
  if (!active) {
    return <Redirect to={`/studio/${stories[0].id}`} replace />;
  }

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
