import { globalStyle } from "@vanilla-extract/css";
import { vh } from "../settings";

globalStyle("#oscilloscope", {
  height: vh(6.5),
  flex: "1 1 0",
});

globalStyle("#oscilloscope-canvas", {
  padding: 0,
  margin: 0,
  height: "100%",
  width: "100%",
});
