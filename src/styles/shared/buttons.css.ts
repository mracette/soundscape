import { style } from "@vanilla-extract/css";

import {
  glowShadow,
  motion,
  radii,
  surfaces,
  textPrimary,
  vh,
  whiteGlow,
} from "../settings";

/**
 * The shared pill button: white outline, translucent dark fill, and a white
 * glow when live (hover/focus/active). Accent colors are never used on
 * buttons — they're reserved for accents.
 */
export const pillButton = style({
  fontSize: vh(1.75),
  fontWeight: 500,
  color: textPrimary,
  background: surfaces.button,
  border: `1px solid ${textPrimary}`,
  borderRadius: radii.pill,
  padding: `${vh(1)} ${vh(2)}`,
  margin: `0 ${vh(0.5)}`,
  flex: "1 1 auto",
  cursor: "pointer",
  transition: `box-shadow ${motion.fast} ${motion.ease}, background ${motion.fast} ${motion.ease}`,
  selectors: {
    "&:first-child": { marginLeft: 0 },
    "&:last-child": { marginRight: 0 },
    "&:disabled": { opacity: 0.4, cursor: "default" },
    "&:hover:not(:disabled), &:focus-visible": {
      boxShadow: glowShadow(whiteGlow),
      background: surfaces.buttonHover,
    },
    "&:active:not(:disabled)": {
      boxShadow: glowShadow("rgba(255, 255, 255, 0.6)"),
    },
  },
});
