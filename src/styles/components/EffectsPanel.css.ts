import { globalStyle, style } from "@vanilla-extract/css";
import { hotGreen, vh } from "../settings";

export const sliderLabel = style({
  paddingTop: vh(1.9),
  paddingBottom: vh(0.8),
});

export const sliderRow = style({
  paddingTop: vh(1),
  paddingBottom: vh(1),
});

export const canvasSlider = style({
  padding: 0,
  margin: 0,
  height: "100%",
  width: "100%",
});

export const canvasSliderWrapper = style({
  cursor: "ew-resize",
  height: "3vh",
  flex: "1 1 0",
  width: "100%",
});

export const effectsControlsRow = style({
  marginTop: vh(4),
});

globalStyle("#effects-panel input", {
  width: "100%",
});

export const switchControl = style({
  position: "relative",
  display: "inline-block",
  width: vh(6),
  height: vh(3),
});

globalStyle(`${switchControl} input`, {
  opacity: 0,
  width: 0,
  height: 0,
});

export const slider = style({
  position: "absolute",
  cursor: "pointer",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "#ccc",
});

globalStyle(`${slider}:before`, {
  position: "absolute",
  content: '""',
  height: vh(2),
  width: vh(2),
  left: vh(0.5),
  bottom: vh(0.5),
  backgroundColor: "white",
});

globalStyle(`input:checked + ${slider}`, {
  backgroundColor: hotGreen,
});

globalStyle(`input:focus + ${slider}`, {
  boxShadow: `0 0 1px ${hotGreen}`,
});

globalStyle(`input:checked + ${slider}:before`, {
  WebkitTransform: `translateX(${vh(3)})`,
  msTransform: `translateX(${vh(3)})`,
  transform: `translateX(${vh(3)})`,
});

export const round = style({
  borderRadius: vh(1.75),
});

globalStyle(`${round}:before`, {
  borderRadius: "50%",
});
