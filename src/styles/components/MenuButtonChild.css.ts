import { style } from "@vanilla-extract/css";
import { glassLight, motion } from "../settings";
import { glassOrb, heroRimActive } from "../shared/glass.css";

export const menuButtonChild = style([
  glassOrb,
  {
    // transition-property stays `all`: position/opacity animate on menu
    // expand, and the hover fill rides the same duration
    transitionDuration: motion.base,
    position: "absolute",
    borderRadius: "50%",
    border: "none",
    selectors: {
      "&:hover, &:focus-visible": {
        backgroundColor: glassLight.tintHover,
      },
    },
  },
]);

export const menuButtonChildOpen = style([
  heroRimActive,
  {
    backgroundColor: glassLight.tintHover,
  },
]);

