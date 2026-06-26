import { style } from "@vanilla-extract/css";
import { fontColor } from "../styles/settings";

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
