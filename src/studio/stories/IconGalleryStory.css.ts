import { style } from "@vanilla-extract/css";

export const galleryWrap = style({ width: "100%" });

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
