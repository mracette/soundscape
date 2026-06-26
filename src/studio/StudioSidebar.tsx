import { Link } from "wouter";
import { stories } from "./stories";
import * as styles from "./StudioSidebar.css";

export const StudioSidebar = ({ activeId }: { activeId: string }) => {
  const groups = stories.reduce<string[]>((acc, s) => {
    if (!acc.includes(s.group)) acc.push(s.group);
    return acc;
  }, []);

  return (
    <nav className={styles.sidebar}>
      {groups.map((group) => (
        <div key={group}>
          <div className={styles.groupLabel}>{group}</div>
          {stories
            .filter((s) => s.group === group)
            .map((s) => (
              <Link
                key={s.id}
                href={`/studio/${s.id}`}
                className={`${styles.navLink} ${
                  s.id === activeId ? styles.navLinkActive : ""
                }`}
              >
                {s.title}
              </Link>
            ))}
        </div>
      ))}
    </nav>
  );
};
