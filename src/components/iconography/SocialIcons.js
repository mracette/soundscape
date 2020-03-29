// libs
import React from "react";

// components
import { Icon } from "../../components/Icon";

// styles
import "../../styles/components/Icon.scss";

export const SocialIcons = (props) => {
  return (
    <div
      id="social-icons"
      className={"icon-row flex-row " + props.divClassList}
    >
      <Icon
        divClassList={"icon-row-child"}
        svgClassList={props.svgClassList || "icon-white"}
        name="icon-envelope"
        link="mailto:mark@soundscape.world"
      />
      <Icon
        divClassList={"icon-row-child"}
        svgClassList={props.svgClassList || "icon-white"}
        name="icon-twitter"
        link="https://twitter.com/markracette"
      />
      <Icon
        divClassList={"icon-row-child"}
        svgClassList={props.svgClassList || "icon-white"}
        name="icon-instagram"
        link="https://instagram.com/rgb.ig"
      />
      <Icon
        divClassList={"icon-row-child"}
        svgClassList={props.svgClassList || "icon-white"}
        name="icon-github"
        link="https://github.com/mracette"
      />
    </div>
  );
};
