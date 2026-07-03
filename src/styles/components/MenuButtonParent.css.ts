import { globalStyle, keyframes, style } from "@vanilla-extract/css";

import { accents, glowShadow, motion } from "../settings";

export const menuButton = style({
  position: "absolute",
  display: "inline-block",
  height: "auto",
  width: "auto",
});

/**
 * The open menu button is a "live" element, so it earns the ambient light:
 * a slow gold glow pulse. Resting (closed) chrome stays quiet — no border,
 * no glow.
 */
const glowPulse = keyframes({
  "0%": { boxShadow: glowShadow(accents.gold.glow.replace("0.45", "0.15")) },
  "100%": { boxShadow: glowShadow(accents.gold.glow) },
});

export const menuButtonParent = style({
  position: "relative",
  border: "none",
  borderRadius: "50%",
});

globalStyle(`${menuButtonParent}.menu-button-parent-open`, {
  "@media": {
    "(prefers-reduced-motion: no-preference)": {
      animation: `${glowPulse} ${motion.slow} ${motion.ease} infinite alternate`,
    },
    "(prefers-reduced-motion: reduce)": {
      boxShadow: glowShadow(accents.gold.glow),
    },
  },
});
