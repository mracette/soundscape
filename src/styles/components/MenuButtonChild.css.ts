import { globalStyle } from "@vanilla-extract/css";
import { vh } from "../settings";

globalStyle(".menu-button-child", {
  transitionDuration: "200ms",
  position: "absolute",
  borderRadius: "50%",
  border: `${vh(0.2)} solid white`,
});

globalStyle(".arrow", {
  position: "absolute",
  width: 0,
  height: 0,
  borderLeftColor: "transparent",
  borderLeftStyle: "solid",
  borderRightColor: "transparent",
  borderRightStyle: "solid",
  borderBottomStyle: "solid",
});
