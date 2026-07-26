import { globalStyle, style } from "@vanilla-extract/css";

import { hotGreen, textPrimary, typeRamp, vh } from "../settings";

export const songInfoPanel = style({
  color: textPrimary,
  display: "flex",
  flexDirection: "column",
  flexWrap: "nowrap",
});

globalStyle(`${songInfoPanel} h2`, {
  marginBottom: vh(1),
});

export const creditType = style({
  color: hotGreen,
  fontWeight: typeRamp.panelLabel.fontWeight,
});

globalStyle(`${songInfoPanel} p`, {
  display: "inline-block",
});
