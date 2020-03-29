// libs
import React from "react";
import { rotatePoint, TAU } from "crco-utils";

// components
import { CustomSongIcon } from "./CustomSongIcon";

// styles
import "../../styles/components/LandingPage.scss";

const addPad = 0.8;

const animate = (context, cycle, coords) => {
  const count = 3;
  const rows = 3;
  const rect = coords.getWidth() / 2.5;
  for (let r = 0; r < rows; r++) {
    for (let i = 0; i < count; i++) {
      const x = (1 - addPad) * -1 + ((1 - addPad) * 2 * (i + 0.5)) / count;
      const y = (1 - addPad) * -1 + ((1 - addPad) * 2 * (r + 0.5)) / rows;
      const mod = 1 - 2 * ((i + r) % 2);
      const rot = rotatePoint(x, y, 0, 0, 0 + mod * cycle + TAU);
      context.beginPath();
      context.rect(
        coords.nx(rot.x) - rect / 2,
        coords.ny(rot.y) - rect / 2,
        rect,
        rect
      );
      context.stroke();
    }
  }
};

export function ComingSoonIcon(props) {
  return (
    <CustomSongIcon
      dispatch={props.dispatch}
      name={props.name}
      id="coming-soon-icon"
      animate={animate}
      listen={true}
    />
  );
}
