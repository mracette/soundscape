// libs
import React from "react";

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
            <u>{c.type}</u>&nbsp;{c.content}
          </p>
        );
      })}
      <h2 className="padded-row">Share</h2>
      {/* <a href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" data-text="Soundscape: a beautiful and relaxing music visualizer for the web." data-url="https://soundscape.world" data-via="markracette" data-show-count="false">Tweet</a>
            <div class="fb-share-button" data-href="https://soundscape.world" data-layout="button" data-size="small"><a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fsoundscape.world%2F&amp;src=sdkpreparse" class="fb-xfbml-parse-ignore">Share</a></div> */}
      <SharingIcons />
      <h2 className="padded-row">Connect</h2>
      <p className="flex-row">
        We are seeking<span className="hot-green">&nbsp;3D artists&nbsp;</span>
        to collaborate with on new content. Please get in touch if you have any
        leads!
      </p>
      <SocialIcons
        divClassList="info-panel-icon-row"
        svgClassList="icon icon-white"
      />
    </div>
  );
};
