import { style } from "@vanilla-extract/css";

export const canvasVizParent = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "black",
  zIndex: -1000,
});

export const canvasViz = style({
  backgroundColor: "white",
  zIndex: -999,
  margin: "auto",
});
