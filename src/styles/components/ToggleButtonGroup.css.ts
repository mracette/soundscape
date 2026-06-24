import { globalStyle } from "@vanilla-extract/css";
import { vh } from "../settings";

globalStyle(".solo-button, .mute-button", {
  fontSize: vh(1.5),
  color: "white",
  padding: 0,
  height: vh(3.25),
  width: vh(3.25),
  borderColor: "white",
  borderStyle: "solid",
  backgroundColor: "rgba(255, 255, 255, 0)",
});

globalStyle(".solo-button", {
  marginLeft: vh(1),
  borderWidth: ".2rem .1rem .2rem .2rem",
});

globalStyle(".solo-button-active", {
  backgroundColor: "rgba(135, 206, 250, 0.5)",
});

globalStyle(".mute-button", {
  borderWidth: ".2rem .2rem .2rem .1rem",
});

globalStyle(".mute-button-active", {
  backgroundColor: "rgba(255, 255, 159, 0.5)",
});

globalStyle(".toggle-button-group", {
  display: "flex",
  flexDirection: "column",
  flexWrap: "nowrap",
});

globalStyle(".toggle-buttons", {
  display: "flex",
  flexDirection: "row",
  flexWrap: "nowrap",
});
