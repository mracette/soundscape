import { globalStyle, style } from "@vanilla-extract/css";
import { hotGreen, hotGreenGlow, vh } from "../settings";

export const sliderLabel = style({
  paddingTop: vh(1.9),
  paddingBottom: vh(0.8),
});

export const sliderLabelPrimary = style([
  sliderLabel,
  {
    color: "white",
  },
]);

export const sliderLabelSecondary = style([
  sliderLabel,
  {
    fontSize: vh(1.6),
    color: "rgba(255, 255, 255, 0.55)",
    paddingTop: vh(1.2),
    paddingBottom: vh(0.4),
  },
]);

export const fineTuneDivider = style({
  display: "flex",
  alignItems: "center",
  gap: vh(1),
  margin: `${vh(2.5)} 0 ${vh(1)} 0`,
});

export const fineTuneDividerLine = style({
  flex: "1 1 auto",
  height: "1px",
  backgroundColor: "rgba(255, 255, 255, 0.15)",
});

export const fineTuneDividerLabel = style({
  fontSize: vh(1.4),
  color: "rgba(255, 255, 255, 0.5)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
});

export const sliderRow = style({
  paddingTop: vh(1),
  paddingBottom: vh(1),
});

export const toggleGroup = style({
  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  padding: `${vh(0.5)} 0`,
  margin: `${vh(1)} 0`,
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
  backgroundColor: "rgba(255, 255, 255, 0.12)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  transitionProperty: "background-color, box-shadow",
  transitionDuration: "200ms",
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
  boxShadow: `0 0 10px ${hotGreenGlow}`,
});

globalStyle(`input:focus + ${slider}`, {
  boxShadow: `0 0 1px ${hotGreen}, 0 0 10px ${hotGreenGlow}`,
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
