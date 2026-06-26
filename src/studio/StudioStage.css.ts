import { style } from "@vanilla-extract/css";

export const stage = style({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
});

export const stageControls = style({
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
  padding: "1.2rem 2.5rem",
  fontSize: "1.6rem",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
});

export const stageCanvas = style({
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "auto",
  padding: "2rem",
});
