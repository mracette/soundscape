import { globalStyle, style } from "@vanilla-extract/css";

import { accents, textPrimary, vh } from "../settings";

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
  color: accents.moss.base,
  fontWeight: 500,
});

globalStyle(`${songInfoPanel} p`, {
  display: "inline-block",
});
