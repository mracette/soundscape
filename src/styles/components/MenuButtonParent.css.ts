import { globalStyle, keyframes, style } from "@vanilla-extract/css";

import { accents, glowShadow, motion, surfaces } from "../settings";

export const menuButton = style({
  position: "absolute",
  display: "inline-block",
  height: "auto",
  width: "auto",
});

export const menuButtonParent = style({
  position: "relative",
  border: `1px solid ${surfaces.hairline}`,
  borderRadius: "50%",
});

/**
 * The open menu button is a "live" element, so it earns the ambient light: a
 * slow gold glow pulse. The glow lives on an ::after pseudo-element and only
 * its opacity animates — opacity runs on the compositor, whereas animating
 * box-shadow directly would repaint every frame on top of the WebGL scene.
 */
const glowPulse = keyframes({
  "0%": { opacity: 0.33 },
  "100%": { opacity: 1 },
});

globalStyle(`${menuButtonParent}::after`, {
  content: '""',
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  pointerEvents: "none",
  boxShadow: glowShadow(accents.gold.glow),
  opacity: 0,
});

globalStyle(`${menuButtonParent}.menu-button-parent-open::after`, {
  "@media": {
    "(prefers-reduced-motion: no-preference)": {
      animation: `${glowPulse} ${motion.slow} ${motion.ease} infinite alternate`,
    },
    "(prefers-reduced-motion: reduce)": {
      opacity: 1,
    },
  },
});
