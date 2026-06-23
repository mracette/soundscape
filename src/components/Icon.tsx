import { useRef, CSSProperties, RefObject } from "react";

import icons from "../assets/svg/iconList.svg";

import "../styles/components/Icon.scss";

interface Props {
  name?: string;
  divClassList?: string;
  svgClassList?: string;
  style?: CSSProperties;
  link?: string;
  handleAddIconRef?: (ref: RefObject<SVGUseElement | null>) => void;
}

export const Icon = (props: Props) => {
  const iconRef = useRef<SVGUseElement>(null);

  if (props.handleAddIconRef) {
    props.handleAddIconRef(iconRef);
  }

  return (
    <div className={props.divClassList}>
      {props.link ? (
        <a href={props.link}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            className={props.svgClassList}
            style={props.style}
            id={props.name}
          >
            <use ref={iconRef} xlinkHref={`${icons}#${props.name}`} />
          </svg>
        </a>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          className={props.svgClassList}
          style={props.style}
          id={props.name}
        >
          <use ref={iconRef} xlinkHref={`${icons}#${props.name}`} />
        </svg>
      )}
    </div>
  );
};
