import { style } from "@vanilla-extract/css";

import { radii } from "../settings";
import { glassSubtle } from "./glass.css";

/**
 * The atmosphere-first panel surface: backdrop-tier glass the scene stays
 * visible through — the same white-tint material as the controls, with
 * legibility carried by the deeper blur rather than a dark fill.
 */
export const veil = style([
  glassSubtle,
  {
    borderRadius: radii.panel,
  },
]);
