import { globalStyle } from "@vanilla-extract/css";
import { hotGreen, vh } from "../settings";

globalStyle(".slider-label", {
  paddingTop: vh(1.9),
  paddingBottom: vh(0.8),
});

globalStyle(".slider-row", {
  paddingTop: vh(1),
  paddingBottom: vh(1),
});

globalStyle(".canvas-slider", {
  padding: 0,
  margin: 0,
  height: "100%",
  width: "100%",
});

globalStyle(".canvas-slider-wrapper", {
  cursor: "ew-resize",
  height: "3vh",
  flex: "1 1 0",
  width: "100%",
});

globalStyle("#effects-controls-row", {
  marginTop: vh(4),
});

globalStyle("#effects-panel input", {
  width: "100%",
});

/* The switch - the box around the slider */
globalStyle(".switch", {
  position: "relative",
  display: "inline-block",
  width: vh(6),
  height: vh(3),
});

/* Hide default HTML checkbox */
globalStyle(".switch input", {
  opacity: 0,
  width: 0,
  height: 0,
});

/* The slider */
globalStyle(".slider", {
  position: "absolute",
  cursor: "pointer",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "#ccc",
});

globalStyle(".slider:before", {
  position: "absolute",
  content: '""',
  height: vh(2),
  width: vh(2),
  left: vh(0.5),
  bottom: vh(0.5),
  backgroundColor: "white",
});

globalStyle("input:checked + .slider", {
  backgroundColor: hotGreen,
});

globalStyle("input:focus + .slider", {
  boxShadow: `0 0 1px ${hotGreen}`,
});

globalStyle("input:checked + .slider:before", {
  WebkitTransform: `translateX(${vh(3)})`,
  msTransform: `translateX(${vh(3)})`,
  transform: `translateX(${vh(3)})`,
});

/* Rounded sliders */
globalStyle(".slider.round", {
  borderRadius: vh(1.75),
});

globalStyle(".slider.round:before", {
  borderRadius: "50%",
});
