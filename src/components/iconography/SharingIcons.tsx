import { sharingLink, iconRow } from "../../styles/components/iconography.css";
import { cx } from "../../utils/cx";

interface Props {
  divClassList?: string;
}

export const SharingIcons = (props: Props) => {
  const url = "https://soundscape.world";
  const tagline =
    "Soundscape: the immersive music visualizer that lets you build your own beats.";

  return (
    <div
      id="sharing-icons"
      className={cx(iconRow, "flex-row", props.divClassList)}
    >
      {
        <>
          <a
            className={sharingLink}
            href={`https://twitter.com/share?url=${url};text=${tagline};via=markracette`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://simplesharebuttons.com/images/somacro/twitter.png"
              alt="Twitter"
            />
          </a>
          <a
            className={sharingLink}
            href={`http://www.facebook.com/sharer.php?u=${url}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://simplesharebuttons.com/images/somacro/facebook.png"
              alt="Facebook"
            />
          </a>
          <a
            className={sharingLink}
            href={`http://reddit.com/submit?url=${url}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://simplesharebuttons.com/images/somacro/reddit.png"
              alt="Reddit"
            />
          </a>
          <a
            className={sharingLink}
            href={`http://pinterest.com/pin/create/link/?url=${url}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://simplesharebuttons.com/images/somacro/pinterest.png"
              alt="Pinterest"
            />
          </a>
          <a
            className={sharingLink}
            href={`https://www.tumblr.com/widgets/share/tool?canonicalUrl=${url}&title=Soundscape&caption=${tagline}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://simplesharebuttons.com/images/somacro/tumblr.png"
              alt="Tumblr"
            />
          </a>
        </>
      }
    </div>
  );
};
