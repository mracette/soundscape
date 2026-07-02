import { style } from "@vanilla-extract/css";
import { easeOrganic, vh } from "../settings";

export const menuButtonChild = style({
  transitionProperty: "left, opacity, box-shadow, border-color",
  transitionDuration: "200ms",
  transitionTimingFunction: easeOrganic,
  position: "absolute",
  borderRadius: "50%",
  border: `${vh(0.2)} solid transparent`,
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
