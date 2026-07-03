import { style } from "@vanilla-extract/css";

import { hotGreen } from "../settings";

/** Live-state indicator ("background mode: on"). */
export const backgroundModeLabel = style({
  color: hotGreen,
});
