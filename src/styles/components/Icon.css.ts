import { globalStyle } from "@vanilla-extract/css";
import { moonYellow, moonYellowGlow } from "../settings";

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
  fill: "white",
  stroke: "white",
});

globalStyle(".icon-moon", {
  fill: moonYellow,
  stroke: moonYellow,
  filter: `drop-shadow(0 0 4px ${moonYellowGlow})`,
});

globalStyle(".rotate45", {
  transform: "rotateZ(45deg)",
});

globalStyle(".scale-div", {
  display: "inline-block",
  position: "absolute",
  transitionDuration: "250ms",
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

globalStyle("#icon-play3-poly", {
  transformOrigin: "50% 50%",
});

globalStyle("#icon-plus", {
  transitionDuration: "250ms",
});

globalStyle("#icon-info", {
  top: "-20%",
  left: "-20%",
  height: "140%",
  width: "140%",
});
