import { globalStyle } from "@vanilla-extract/css";
import { motion, textPrimary } from "../settings";

globalStyle(".icon", {
  height: "100%",
  width: "100%",
});

globalStyle(".toggle-icon", {
  position: "absolute",
  height: "100%",
  width: "100%",
  top: 0,
  left: 0,
});

globalStyle(".menu-button-icon", {
  position: "absolute",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0,
});

globalStyle(".icon-white", {
  fill: textPrimary,
  stroke: textPrimary,
});

/**
 * For stroke-drawn (Lucide) icons: forcing `fill` white would override their
 * fill="none" and render solid blobs, so this class colors the stroke only.
 * `.icon-white` stays for the fill-drawn toggle icons in ToggleButtonView.
 */
globalStyle(".icon-line", {
  fill: "none",
  stroke: textPrimary,
});

globalStyle(".rotate45", {
  transform: "rotateZ(45deg)",
});

globalStyle(".scale-div", {
  display: "inline-block",
  position: "absolute",
  transitionDuration: motion.base,
  transformOrigin: "50% 50%",
  top: "25%",
  left: "25%",
  height: "50%",
  width: "50%",
  margin: "auto",
});

globalStyle(".scale-div-morph", {
  display: "inline-block",
  position: "absolute",
  transformOrigin: "50% 50%",
  top: "37.5%",
  left: "37.5%",
  height: "25%",
  width: "25%",
  margin: "auto",
});

