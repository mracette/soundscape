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
