import { style } from "@vanilla-extract/css";
import { textPrimary, vh } from "../settings";

export const toggleButton = style({
  position: "relative",
  borderRadius: "50%",
  border: "none",
  padding: 0,
  overflowWrap: "break-word",
  backgroundColor: "transparent",
  zIndex: 99,
  marginRight: vh(3),
  cursor: "pointer",
  selectors: {
    "&:focus": {
      outline: "none",
    },
    "&:last-child": {
      marginRight: 0,
    },
  },
});

export const svgCircle = style({
  position: "absolute",
  display: "inline",
  top: 0,
  left: 0,
  fillOpacity: 0,
  stroke: textPrimary,
  strokeLinecap: "round",
  transformOrigin: "50% 50%",
});
