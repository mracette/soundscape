import { style } from "@vanilla-extract/css";
import { accents, glowShadow, motion } from "../settings";

export const menuButtonChild = style({
  transitionDuration: motion.base,
  position: "absolute",
  borderRadius: "50%",
  border: "none",
  selectors: {
    "&:hover, &:focus-visible": {
      boxShadow: glowShadow(accents.dusk.glow),
    },
  },
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
