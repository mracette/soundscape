// libs
import React from "react";
import { TAU, rotatePoint } from "crco-utils";

// components
import { CustomSongIcon } from "./CustomSongIcon";

// styles
import "../../styles/components/LandingPage.scss";

const animate = (context, cycle, coords) => {
  for (let i = 0; i < 5; i++) {
    context.beginPath();
    context.arc(
      coords.nx(rotatePoint(0.2, 0, 0, 0, cycle + (TAU * i) / 5).x),
      coords.ny(rotatePoint(0.2, 0, 0, 0, cycle + (TAU * i) / 5).y),
      coords.getWidth() / 4,
      0,
      TAU
    );
    context.stroke();
  }
};

export function MoonriseIcon(props) {
  return (
    <CustomSongIcon
      dispatch={props.dispatch}
      name={props.name}
      id="custom-moonrise-icon"
      animate={animate}
      listen={true}
    />
  );
}
