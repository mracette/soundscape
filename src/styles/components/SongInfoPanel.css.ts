import { globalStyle } from "@vanilla-extract/css";
import { vh } from "../settings";

globalStyle("#song-info-panel", {
  color: "white",
  display: "flex",
  flexDirection: "column",
  flexWrap: "nowrap",
});

globalStyle("#song-info-panel p", {
  display: "inline-block",
});

globalStyle(".social-link", {
  display: "inline-block",
});

globalStyle(".padded-row", {
  marginTop: vh(4),
});

globalStyle(".row-margin-bottom", {
  marginBottom: vh(2),
});

globalStyle(".row-margin-top", {
  marginTop: vh(2),
});
