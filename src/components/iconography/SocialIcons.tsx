import { Icon } from "../../components/Icon";
import "../../styles/components/Icon.css";

interface Props {
  divClassList?: string;
  svgClassList?: string;
}

export const SocialIcons = (props: Props) => {
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
        name="icon-github"
        link="https://github.com/mracette"
      />
    </div>
  );
};
