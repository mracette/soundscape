import { style } from "@vanilla-extract/css";
import { vh } from "../settings";

/** breathing room between the panel's button row and the first voice group */
export const panelButtonRow = style({
  marginBottom: vh(1.2),
});
