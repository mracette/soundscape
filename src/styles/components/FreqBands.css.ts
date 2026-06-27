import { style } from "@vanilla-extract/css";
import { vh } from "../settings";

export const freqBands = style({
  top: vh(1.5),
  left: vh(1.5),
  position: "absolute",
});

export const freqBandsCanvas = style({
  padding: 0,
  margin: 0,
  height: vh(9),
  width: vh(9),
});
