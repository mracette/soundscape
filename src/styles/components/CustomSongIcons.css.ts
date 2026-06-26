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
  width: "25rem",
  height: "25rem",
});

export const customSongIconMobile = style({
  display: "block",
  margin: 0,
  width: "15rem",
  height: "15rem",
});
