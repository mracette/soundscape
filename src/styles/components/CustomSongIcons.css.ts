import { style } from "@vanilla-extract/css";
import { hotGreen } from "../settings";

export const newLabel = style({
  position: "absolute",
  top: "15px",
  left: "15px",
  fontSize: "1.6rem",
  color: hotGreen,
});

export const customSongIcon = style({
  display: "block",
  margin: 0,
  width: "12rem",
  height: "12rem",
});

export const customSongIconMobile = style({
  display: "block",
  margin: 0,
  width: "15rem",
  height: "15rem",
});
