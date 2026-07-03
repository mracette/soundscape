import { style } from "@vanilla-extract/css";
import { accents, liveGlowSelectors, motion, surfaces } from "../settings";

export const menuButtonChild = style({
  transitionDuration: motion.base,
  position: "absolute",
  borderRadius: "50%",
  border: `1px solid ${surfaces.hairline}`,
  selectors: liveGlowSelectors(accents.dusk.glow),
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
