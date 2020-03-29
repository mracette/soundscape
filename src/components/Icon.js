import React from "react";

import icons from "../assets/svg/iconList.svg";

import "../styles/components/Icon.scss";

export const Icon = (props) => {
  const iconRef = React.useRef(null);

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
