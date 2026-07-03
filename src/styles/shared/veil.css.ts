import { style } from "@vanilla-extract/css";

import { radii, surfaces } from "../settings";

/**
 * The atmosphere-first panel surface: a dark translucent "veil" the scene
 * stays visible through. No border, no glow — resting chrome stays quiet.
 * The background here is a fallback; the per-scene tint (ThemeContext
 * contentPanelColor) is applied inline by consumers and wins over it.
 * Legibility is tuned via the tint's opacity/color, never font weight.
 */
export const veil = style({
  borderRadius: radii.panel,
  background: surfaces.veil,
});
