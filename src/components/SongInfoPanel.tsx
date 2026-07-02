import { useContext } from "react";

import { SongContext } from "../contexts/contexts";
import { InfoContext } from "../contexts/contexts";

import { songInfoPanel } from "../styles/components/SongInfoPanel.css";
import { hotGreen } from "../styles/settings";

export const SongInfoPanel = () => {
  const { name } = useContext(SongContext)!;
  const { credits } = useContext(InfoContext)!;

  return (
    <div id="song-info-panel" className={songInfoPanel}>
      <h2>"{name}"</h2>
      {credits.map((c) => {
        return (
          <p key={c.type}>
            <span style={{ color: hotGreen }}>{c.type}</span>
            &nbsp;
            {c.link ? <a href={c.link}>{c.content}</a> : c.content}
          </p>
        );
      })}
    </div>
  );
};
