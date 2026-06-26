import { globalStyle, style } from "@vanilla-extract/css";
import { vh } from "../settings";

export const menuButtonContent = style({
  visibility: "visible",
  borderRadius: ".75rem .75rem",
  position: "absolute",
  width: "auto",
  background: "rgba(255, 255, 255, 0.15)",
  overflow: "auto",
});

globalStyle(`${menuButtonContent} *`, {
  willChange: "visibility",
  color: "white",
});

globalStyle(`${menuButtonContent} p`, {
  margin: `${vh(0.5)} 0 ${vh(0.5)} 0`,
  display: "inline-block",
  fontSize: vh(1.75),
});
