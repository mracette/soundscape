import { useContext } from "react";

import { SongContext } from "../contexts/contexts";
import { InfoContext } from "../contexts/contexts";

import {
  creditType,
  songInfoPanel,
} from "../styles/components/SongInfoPanel.css";

export const SongInfoPanel = () => {
  const { name } = useContext(SongContext)!;
  const { credits } = useContext(InfoContext)!;

  return (
    <div id="song-info-panel" className={songInfoPanel}>
      <h2>{name}</h2>
      {credits.map((c) => {
        return (
          <p key={c.type}>
            <span className={creditType}>{c.type}</span>
            &nbsp;
            {c.link ? (
              <a href={c.link} target="_blank" rel="noreferrer">
                {c.content}
              </a>
            ) : (
              c.content
            )}
          </p>
        );
      })}
    </div>
  );
};
