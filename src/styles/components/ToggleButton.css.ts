import { globalStyle } from "@vanilla-extract/css";
import { vh } from "../settings";

globalStyle(".toggle-button", {
  position: "relative",
  borderRadius: "50%",
  border: "none",
  padding: 0,
  overflowWrap: "break-word",
  backgroundColor: "rgba(255, 255, 255, 0)",
  zIndex: 99,
  marginRight: vh(3),
  cursor: "pointer",
});

globalStyle(".toggle-button:focus", {
  outline: "none",
});

globalStyle(".toggle-button:last-child", {
  marginRight: 0,
});

globalStyle(".svg-circle", {
  position: "absolute",
  display: "inline",
  top: 0,
  left: 0,
  fillOpacity: 0,
  stroke: "white",
  strokeLinecap: "round",
  transformOrigin: "50% 50%",
});
