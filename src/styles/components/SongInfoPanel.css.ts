import { globalStyle, style } from "@vanilla-extract/css";

export const songInfoPanel = style({
  color: "white",
  display: "flex",
  flexDirection: "column",
  flexWrap: "nowrap",
});

globalStyle(`${songInfoPanel} p`, {
  display: "inline-block",
});
