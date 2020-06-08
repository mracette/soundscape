// libs
import React from "react";
import { Link } from "react-router-dom";

// components
import { SocialIcons } from "./iconography/SocialIcons";
import { SharingIcons } from "./iconography/SharingIcons";

// context
import { SongContext } from "../contexts/contexts";
import { InfoContext } from "../contexts/contexts";

// styles
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
      <h2 className="padded-row">Share</h2>
      <SharingIcons />
      <h2 className="padded-row">Connect</h2>
      {/* <p className="flex-row">
        We are seeking<span className="hot-green">&nbsp;3D artists&nbsp;</span>
        to collaborate with on new content. Please get in touch if you have any
        leads!
      </p> */}
      <SocialIcons svgClassList="icon icon-white info-panel-icon" />
      <p>
        <Link to="/info">{"Sign up for email updates on new content"}</Link>
      </p>
    </div>
  );
};
