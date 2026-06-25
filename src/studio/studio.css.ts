import { style } from "@vanilla-extract/css";
import { offBlack2, fontColor } from "../styles/settings";

export const root = style({
  display: "flex",
  flexDirection: "column",
  position: "fixed",
  inset: 0,
  color: fontColor,
  background: offBlack2,
});

export const header = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "1.5rem 2.5rem",
  borderBottom: "1px solid rgba(255,255,255,0.15)",
});

export const title = style({ fontSize: "2.6rem", margin: 0 });

export const body = style({ display: "flex", flex: 1, minHeight: 0 });

export const sidebar = style({
  width: "20rem",
  flexShrink: 0,
  borderRight: "1px solid rgba(255,255,255,0.15)",
  padding: "1rem 1.5rem",
  overflowY: "auto",
});

export const groupLabel = style({
  fontSize: "1.3rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  opacity: 0.45,
  margin: "2rem 0 0.6rem",
});

export const navLink = style({
  display: "block",
  padding: "0.6rem 0.8rem",
  marginBottom: "0.2rem",
  borderRadius: "0.5rem",
  color: fontColor,
  textDecoration: "none",
  fontSize: "1.8rem",
  ":hover": { background: "rgba(255,255,255,0.08)" },
});

export const navLinkActive = style({ background: "rgba(255,255,255,0.16)" });

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

export const stageCanvasLight = style({ background: "#e6e6e6" });

export const controlButton = style({
  fontFamily: "inherit",
  fontSize: "1.5rem",
  color: fontColor,
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.25)",
  borderRadius: "0.5rem",
  padding: "0.5rem 1.2rem",
  cursor: "pointer",
});

export const menuStage = style({ position: "relative", width: "100%", height: "45rem" });

export const iconGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(12rem, 1fr))",
  gap: "2rem",
  width: "100%",
  padding: "1rem",
});

export const iconCell = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.8rem",
  fontSize: "1.3rem",
  opacity: 0.85,
  wordBreak: "break-all",
  textAlign: "center",
});

export const iconCellSvg = style({ width: "5rem", height: "5rem" });

export const iconSection = style({
  fontSize: "1.6rem",
  opacity: 0.6,
  margin: "2.5rem 0 1rem",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
});

export const galleryWrap = style({ width: "100%" });

export const loadingStory = style({ textAlign: "center" });
