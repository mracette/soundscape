import { globalStyle } from "@vanilla-extract/css";
import { moonYellow, vh } from "../settings";

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

globalStyle(".sharing-link", {
  padding: vh(1),
});

globalStyle(".sharing-link img", {
  width: vh(6),
  height: vh(6),
});

globalStyle(".info-panel-icon", {
  width: vh(5),
  height: vh(5),
});

globalStyle(".icon-row", {
  width: "100%",
});

globalStyle(".coming-soon-icon-row", {
  margin: "5vh 0 5vh 0",
});

globalStyle(".icon-row-child", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: vh(6),
  height: vh(6),
  padding: vh(1),
});

globalStyle(".icon-row-child:first-child", {
  marginLeft: 0,
});

globalStyle(".icon-row-child:last-child", {
  marginRight: 0,
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
