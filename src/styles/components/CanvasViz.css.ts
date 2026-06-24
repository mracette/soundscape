import { globalStyle } from "@vanilla-extract/css";

globalStyle("#canvas-viz-parent", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "black",
  zIndex: -1000,
});

globalStyle("#canvas-viz", {
  backgroundColor: "white",
  zIndex: -999,
  margin: "auto",
});
