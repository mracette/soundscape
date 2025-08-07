import React from "react";

import { SongContext } from "../contexts/contexts";
import { InfoContext } from "../contexts/contexts";

import "../styles/components/SongInfoPanel.scss";

export const SongInfoPanel = (props) => {
  const { name } = React.useContext(SongContext);
  const { credits } = React.useContext(InfoContext);

  return (
    <div id="song-info-panel">
      <h2>"{name}"</h2>
      {credits.map((c) => {
        return (
          <p key={c.type}>
            <span style={{ color: "rgb(0, 225, 158)" }}>{c.type}</span>
            &nbsp;
            {c.link ? <a href={c.link}>{c.content}</a> : c.content}
          </p>
        );
      })}
    </div>
  );
};
