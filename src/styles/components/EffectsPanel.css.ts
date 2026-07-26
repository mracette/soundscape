import { createVar, globalStyle, style } from "@vanilla-extract/css";
import {
  glassLight,
  motion,
  radii,
  surfaces,
  textPrimary,
  typeRamp,
  vh,
} from "../settings";
import {
  accentFill,
  channelHeight,
  glassChannel,
  glassLens,
  lensSize,
} from "../shared/controls.css";

/**
 * One shared gap between every row and section — the panel's whole vertical
 * rhythm lives here. Rows must not add their own vertical margins/paddings,
 * so the global h2/p margins are zeroed below and the label styles carry no
 * vertical padding.
 */
export const effectsPanel = style({
  gap: vh(1.6),
});

globalStyle(`${effectsPanel} h2, ${effectsPanel} p`, {
  margin: 0,
});

/** All slider labels (time warp, energy, More FX trio) share this voice. */
export const primarySliderLabel = style({
  fontSize: typeRamp.panelLabel.fontSize,
  fontWeight: typeRamp.panelLabel.fontWeight,
});

/**
 * Disclosure header for the secondary sliders — same voice as the primary
 * labels, with a caret that rotates to point down when the section is open.
 */
export const moreFxToggle = style({
  display: "flex",
  alignItems: "center",
  gap: vh(1),
  padding: 0,
  border: "none",
  background: "none",
  color: textPrimary,
  fontFamily: "inherit",
  fontSize: typeRamp.panelLabel.fontSize,
  fontWeight: typeRamp.panelLabel.fontWeight,
  cursor: "pointer",
});

/** margin/line-height zeroed so the glyph centres on the label text */
export const moreFxCaret = style({
  display: "inline-block",
  margin: 0,
  lineHeight: 1,
  transition: `transform ${motion.base} ${motion.ease}`,
});

export const moreFxCaretOpen = style({
  transform: "rotate(90deg)",
});

/** Raised cluster grouping related rows: the toggle switches, and the More FX sliders. */
export const toggleCluster = style({
  borderRadius: radii.control,
  background: surfaces.raised,
  padding: `${vh(0.5)} ${vh(1.5)}`,
});

/** the More FX cluster spaces its rows itself, with one even internal gap */
export const moreFxCluster = style({
  display: "flex",
  flexDirection: "column",
  gap: vh(0.7),
  padding: `${vh(0.9)} ${vh(1.5)}`,
});

export const sliderRow = style({
  paddingTop: vh(0.85),
  paddingBottom: vh(0.85),
});

globalStyle("#effects-panel input", {
  width: "100%",
});

/**
 * Switch: the slider's channel and lens at two stops. Custom properties carry
 * the knob's position and the fill's edge, so `:checked` flips both in one
 * rule: off leaves the fill level with the knob's near edge, on runs it the
 * full width of the channel, exactly as the slider does at either end.
 *
 * Every piece sets its own margin: these are spans, and the global `span, p`
 * bottom margin would otherwise push the control off the row's centre line and
 * collapse the fill, which takes its height from `top`/`bottom` alone.
 */
const switchWidth = vh(7);
const knobOffset = createVar();
const fillEdge = createVar();

export const switchRow = style({
  gap: vh(1.5),
  cursor: "pointer",
});

/** control labels, in the same voice as the slider labels */
export const switchLabel = style({
  ...typeRamp.panelLabel,
  margin: 0,
  color: textPrimary,
});

export const switchControl = style({
  position: "relative",
  display: "inline-block",
  flexShrink: 0,
  width: switchWidth,
  height: lensSize,
  margin: 0,
  vars: { [knobOffset]: "0px", [fillEdge]: "0%" },
});

globalStyle(`${switchControl} input`, {
  position: "absolute",
  opacity: 0,
  width: 0,
  height: 0,
});

globalStyle(`${switchControl}:has(input:checked)`, {
  vars: {
    [knobOffset]: `calc(${switchWidth} - ${lensSize})`,
    [fillEdge]: "100%",
  },
});

globalStyle(`${switchControl}:has(input:focus-visible)`, {
  outline: `2px solid ${glassLight.rimMid}`,
  outlineOffset: "2px",
  borderRadius: radii.pill,
});

export const switchTrack = style([
  glassChannel,
  {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: "auto 0",
    height: channelHeight,
  },
]);

export const switchFill = style({
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  width: fillEdge,
  margin: 0,
  borderRadius: radii.pill,
  ...accentFill,
  transition: `width ${motion.base} ${motion.ease}`,
});

export const switchKnob = style([
  glassLens,
  {
    position: "absolute",
    top: `calc(50% - ${lensSize} / 2)`,
    left: knobOffset,
    width: lensSize,
    height: lensSize,
    margin: 0,
    backgroundColor: glassLight.tintHover,
    transition: `left ${motion.base} ${motion.ease}, background-color ${motion.fast} ${motion.ease}`,
    selectors: {
      [`${switchRow}:hover &`]: {
        backgroundColor: glassLight.tintActive,
      },
    },
  },
]);
