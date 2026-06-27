import { style } from "@vanilla-extract/css";
import { vh } from "../settings";

export const menuButton = style({
  position: "absolute",
  display: "inline-block",
  height: "auto",
  width: "auto",
});

export const menuButtonParent = style({
  position: "relative",
  border: `${vh(0.2)} solid white`,
  borderRadius: "50%",
});
