import { style } from "@vanilla-extract/css";

import { accents } from "../settings";

/** Live-state indicator ("background mode: on") — earns the moss accent. */
export const backgroundModeLabel = style({
  color: accents.moss.base,
});
