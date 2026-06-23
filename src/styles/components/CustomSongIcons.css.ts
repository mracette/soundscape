import { globalStyle } from "@vanilla-extract/css";
import { hotGreen, mSize, moonYellow } from "../settings";

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

globalStyle("#loading-button-wrapper", {
  width: "25rem",
  height: "25rem",
});

globalStyle("#loading-button", {
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

globalStyle("#loading-button *", {
  textTransform: "none",
  fontSize: mSize,
  color: moonYellow,
});
