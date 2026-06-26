import { globalStyle } from "@vanilla-extract/css";
import { hotGreen } from "../settings";

globalStyle(".new-label", {
  position: "absolute",
  top: "15px",
  left: "15px",
  fontSize: "1.6rem",
  color: hotGreen,
});

globalStyle(".custom-song-icon", {
  display: "block",
  margin: 0,
  width: "25rem",
  height: "25rem",
});

globalStyle(".custom-song-icon-mobile", {
  display: "block",
  margin: 0,
  width: "15rem",
  height: "15rem",
});
