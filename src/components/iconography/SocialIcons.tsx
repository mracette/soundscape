import { Icon } from "../../components/Icon";
import "../../styles/components/Icon.css";
import { iconRow, iconRowChild } from "../../styles/components/iconography.css";
import { cx } from "../../utils/cx";

interface Props {
  divClassList?: string;
  svgClassList?: string;
}

export const SocialIcons = (props: Props) => {
  return (
    <div
      id="social-icons"
      className={cx(iconRow, "flex-row", props.divClassList)}
    >
      <Icon
        divClassList={iconRowChild}
        svgClassList={props.svgClassList || "icon-white"}
        name="icon-envelope"
        link="mailto:mark@soundscape.world"
      />
      <Icon
        divClassList={iconRowChild}
        svgClassList={props.svgClassList || "icon-white"}
        name="icon-twitter"
        link="https://twitter.com/markracette"
      />
      {/* <Icon
        divClassList={iconRowChild}
        svgClassList={props.svgClassList || "icon-white"}
        name="icon-instagram"
        link="https://instagram.com/rgb.ig"
      /> */}
      <Icon
        divClassList={iconRowChild}
        svgClassList={props.svgClassList || "icon-white"}
        name="icon-github"
        link="https://github.com/mracette"
      />
    </div>
  );
};
