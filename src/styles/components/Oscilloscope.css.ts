import { style } from "@vanilla-extract/css";
import { vh } from "../settings";

export const oscilloscope = style({
  height: vh(6.5),
  flex: "1 1 0",
});

export const oscilloscopeCanvas = style({
  padding: 0,
  margin: 0,
  height: "100%",
  width: "100%",
});
