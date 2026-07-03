import { style } from "@vanilla-extract/css";
import { liveGlowSelectors, motion, vh, whiteGlow } from "../settings";

export const menuButtonChild = style({
  transitionDuration: motion.base,
  position: "absolute",
  borderRadius: "50%",
  border: `${vh(0.2)} solid white`,
  selectors: liveGlowSelectors(whiteGlow),
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
