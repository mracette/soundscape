import { style } from "@vanilla-extract/css";
import { easeOrganic, vh } from "../settings";

export const menuButton = style({
  position: "absolute",
  display: "inline-block",
  height: "auto",
  width: "auto",
});

export const menuButtonParent = style({
  position: "relative",
  border: `${vh(0.2)} solid rgba(255, 255, 255, 0.5)`,
  borderRadius: "50%",
  boxShadow: "0 0 14px rgba(255, 255, 255, 0.25)",
  transitionProperty: "box-shadow, border-color",
  transitionDuration: "200ms",
  transitionTimingFunction: easeOrganic,
});
