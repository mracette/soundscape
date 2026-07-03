import { globalStyle, style } from "@vanilla-extract/css";
import {
  accents,
  glowShadow,
  lightGrey,
  radii,
  surfaces,
  textPrimary,
  textSecondary,
  vh,
} from "../settings";

/** Primary controls (time warp, energy) get the visual weight. */
export const primarySliderLabel = style({
  paddingTop: vh(1.9),
  paddingBottom: vh(0.8),
  fontSize: vh(2.2),
  fontWeight: 500,
});

/**
 * The fine-tune trio stays fully visible (no disclosure — "no added steps")
 * but reads as secondary: smaller, tighter, dimmer.
 */
export const fineTuneLabel = style({
  paddingTop: vh(1.2),
  paddingBottom: vh(0.5),
  fontSize: vh(1.5),
  color: textSecondary,
});

/** A real section divider: label flanked by hairline rules. */
export const fineTuneDivider = style({
  display: "flex",
  alignItems: "center",
  gap: vh(1.5),
  width: "100%",
  marginTop: vh(2.5),
  color: textSecondary,
  fontSize: vh(1.5),
  fontWeight: 300,
  textTransform: "lowercase",
});

globalStyle(`${fineTuneDivider}::before, ${fineTuneDivider}::after`, {
  content: '""',
  flex: "1 1 auto",
  borderTop: `1px solid ${surfaces.hairline}`,
});

/** Groups the three toggle rows so they read as one cluster of settings. */
export const toggleCluster = style({
  borderRadius: radii.control,
  background: surfaces.raised,
  padding: `${vh(0.5)} ${vh(1.5)}`,
  margin: `${vh(1)} 0`,
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
  backgroundColor: lightGrey,
});

globalStyle(`${slider}:before`, {
  position: "absolute",
  content: '""',
  height: vh(2),
  width: vh(2),
  left: vh(0.5),
  bottom: vh(0.5),
  backgroundColor: textPrimary,
});

globalStyle(`input:checked + ${slider}`, {
  backgroundColor: accents.moss.base,
  boxShadow: glowShadow(accents.moss.glow),
});

globalStyle(`input:focus + ${slider}`, {
  boxShadow: glowShadow(accents.moss.glow),
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
