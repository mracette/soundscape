import { style } from "@vanilla-extract/css";
import { hotGreen, typeRamp } from "../settings";

export const newLabel = style({
  ...typeRamp.bodyCompact,
  position: "absolute",
  top: "15px",
  left: "15px",
  color: hotGreen,
});

export const customSongIcon = style({
  display: "block",
  margin: 0,
  width: "16.5rem",
  height: "16.5rem",
});

/**
 * The loading icon carries the landing page on its own rather than sitting
 * beside a song name, so it runs at twice the song-card size.
 */
export const loadingIcon = style({
  display: "block",
  margin: 0,
  width: "26rem",
  height: "26rem",
});

export const loadingIconMobile = style({
  display: "block",
  margin: 0,
  width: "33rem",
  height: "33rem",
});
