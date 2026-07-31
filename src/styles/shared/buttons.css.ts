import { style } from "@vanilla-extract/css";

import { glassLight, radii, textPrimary, typeRamp, vh } from "../settings";
import { glass, glassHover, heroRimActive } from "./glass.css";

/**
 * The shared pill button: borderless full-glass material. Hover/focus
 * feedback is the glass body brightening — no glow, no outline. Accent
 * colors are never used on buttons — they're reserved for accents.
 */
export const pillButton = style([
  glass,
  glassHover,
  {
    ...typeRamp.panelLabel,
    color: textPrimary,
    border: "none",
    borderRadius: radii.pill,
    padding: `${vh(1)} ${vh(2)}`,
    margin: `0 ${vh(0.5)}`,
    flex: "1 1 auto",
    cursor: "pointer",
    selectors: {
      "&:first-child": { marginLeft: 0 },
      "&:last-child": { marginRight: 0 },
      "&:disabled": {
        opacity: 0.4,
        cursor: "default",
        backgroundColor: glassLight.tint,
      },
    },
  },
]);

/**
 * A full-width row of evenly distributed pills. The panels' `.flex-row`
 * wraps on overflow, which would drop the last pill onto its own line, so
 * crowded button rows use this non-wrapping row instead.
 */
export const pillRow = style({
  display: "flex",
  width: "100%",
  alignItems: "center",
  flexWrap: "nowrap",
});

/**
 * Companion to pillButton inside pillRow: a zero basis makes every pill the
 * same width regardless of label length, and the tighter horizontal padding
 * keeps long labels fitting in crowded rows. Declared after pillButton so
 * its overrides win the specificity tie.
 */
export const pillButtonEven = style({
  flex: "1 1 0",
  minWidth: 0,
  padding: `${vh(1.3)} ${vh(0.75)}`,
});

/**
 * Selected state for a pill that latches (the Background Mode presets): the
 * hero-gradient rim plus the hover body tint held on, so it reads the same as
 * an open radial-menu button.
 */
export const pillButtonActive = style([
  heroRimActive,
  {
    backgroundColor: glassLight.tintHover,
  },
]);
