import { style } from "@vanilla-extract/css";
import {
  offBlack2,
  radii,
  surfaces,
  textPrimary,
  textSecondary,
} from "../../styles/settings";

export const wrap = style({
  width: "100%",
  background: offBlack2,
  color: textPrimary,
  padding: "2rem",
  display: "flex",
  flexDirection: "column",
  gap: "3rem",
});

export const sectionTitle = style({
  fontSize: "1.6rem",
  opacity: 0.6,
  margin: "0 0 1rem",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
});

export const accentGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))",
  gap: "2rem",
});

export const accentCard = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.8rem",
});

export const swatch = style({
  width: "100%",
  height: "6rem",
  borderRadius: radii.control,
});

export const glowChip = style({
  width: "100%",
  height: "3rem",
  borderRadius: radii.pill,
  background: surfaces.raised,
});

export const gradientBar = style({
  width: "100%",
  height: "1.5rem",
  borderRadius: radii.control,
});

export const label = style({
  fontSize: "1.3rem",
  opacity: 0.85,
});

export const sub = style({
  fontSize: "1.1rem",
  color: textSecondary,
});

export const textSample = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

export const primaryText = style({
  color: textPrimary,
  fontSize: "1.6rem",
});

export const secondaryText = style({
  color: textSecondary,
  fontSize: "1.6rem",
});

export const radiiRow = style({
  display: "flex",
  gap: "2rem",
  flexWrap: "wrap",
});

export const radiiCard = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.8rem",
});

export const pillSurface = style({
  width: "10rem",
  height: "3rem",
  borderRadius: radii.pill,
  background: surfaces.raised,
});

export const panelSurface = style({
  width: "12rem",
  height: "8rem",
  borderRadius: radii.panel,
  background: surfaces.raised,
});

export const controlSurface = style({
  width: "8rem",
  height: "5rem",
  borderRadius: radii.control,
  background: surfaces.raised,
});

export const typeRamp = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});
