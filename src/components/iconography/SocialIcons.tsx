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
      <a href="mailto:mark@soundscape.world">
        <Icon
          divClassList={iconRowChild}
          svgClassList={props.svgClassList || "icon-white"}
          name="icon-envelope"
        />
      </a>
      <a href="https://twitter.com/markracette">
        <Icon
          divClassList={iconRowChild}
          svgClassList={props.svgClassList || "icon-white"}
          name="icon-twitter"
        />
      </a>
      <a href="https://github.com/mracette">
        <Icon
          divClassList={iconRowChild}
          svgClassList={props.svgClassList || "icon-white"}
          name="icon-github"
        />
      </a>
    </div>
  );
};
