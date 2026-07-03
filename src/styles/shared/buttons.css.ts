import { style, styleVariants } from "@vanilla-extract/css";

import type { AccentGroup } from "../settings";
import {
  accents,
  glowShadow,
  motion,
  radii,
  surfaces,
  textPrimary,
  vh,
} from "../settings";

/**
 * The shared pill button: quiet at rest (translucent dark fill, no border),
 * lit when live — hover/focus/active earn an accent glow via
 * `pillButtonAccent`. Pair as cx(pillButton, pillButtonAccent.<role>).
 */
export const pillButton = style({
  fontSize: vh(1.75),
  fontWeight: 500,
  color: textPrimary,
  background: surfaces.button,
  border: "none",
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
  },
});

const accentVariant = (accent: AccentGroup) => ({
  selectors: {
    "&:hover:not(:disabled), &:focus-visible": {
      boxShadow: glowShadow(accent.glow),
      background: surfaces.buttonHover,
    },
    "&:active:not(:disabled)": {
      boxShadow: glowShadow(accent.glow.replace("0.45", "0.6")),
    },
  },
});

/**
 * Accent-per-action-role variants. gold and bloom are intentionally absent:
 * gold is the lighting color, bloom is reserved for garden-gate moments.
 */
export const pillButtonAccent = styleVariants({
  primary: accentVariant(accents.ember),
  info: accentVariant(accents.dusk),
  affirmative: accentVariant(accents.moss),
});
