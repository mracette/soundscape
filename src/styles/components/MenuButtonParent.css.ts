import { style } from "@vanilla-extract/css";

import { glassOrb, glassHover } from "../shared/glass.css";

export const menuButton = style({
  position: "absolute",
  display: "inline-block",
  height: "auto",
  width: "auto",
});

export const menuButtonParent = style([
  glassOrb,
  glassHover,
  {
    position: "relative",
    border: "none",
    borderRadius: "50%",
  },
]);
