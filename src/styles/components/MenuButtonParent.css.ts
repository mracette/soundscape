import { globalStyle } from "@vanilla-extract/css";
import { vh } from "../settings";

globalStyle(".menu-button", {
  position: "absolute",
  display: "inline-block",
  height: "auto",
  width: "auto",
});

globalStyle(".menu-button-parent", {
  position: "relative",
  border: `${vh(0.2)} solid white`,
  borderRadius: "50%",
});
