import { style } from "@vanilla-extract/css";
import { vh } from "../settings";

export const menuButtonChild = style({
  transitionDuration: "200ms",
  position: "absolute",
  borderRadius: "50%",
  border: `${vh(0.2)} solid white`,
});

export const arrow = style({
  position: "absolute",
  width: 0,
  height: 0,
  borderLeftColor: "transparent",
  borderLeftStyle: "solid",
  borderRightColor: "transparent",
  borderRightStyle: "solid",
  borderBottomStyle: "solid",
});
