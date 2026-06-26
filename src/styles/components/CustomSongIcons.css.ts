import { globalStyle, style } from "@vanilla-extract/css";
import { hotGreen, mSize, moonYellow } from "../settings";

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

export const loadingButton = style({
  position: "absolute",
  width: "25rem",
  height: "25rem",
  margin: 0,
  padding: "0px",
  textAlign: "center",
  verticalAlign: "middle",
  border: "none",
  borderRadius: "50%",
  backgroundColor: "rgba(255, 0, 0, 0)",
});

globalStyle(`${loadingButton} *`, {
  textTransform: "none",
  fontSize: mSize,
  color: moonYellow,
});
