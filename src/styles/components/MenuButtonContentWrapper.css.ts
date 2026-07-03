import { globalStyle, style } from "@vanilla-extract/css";
import { vh } from "../settings";
import { veil } from "../shared/veil.css";

export const menuButtonContent = style([
  veil,
  {
    visibility: "visible",
    position: "absolute",
    width: "auto",
    overflow: "auto",
  },
]);

globalStyle(`${menuButtonContent} *`, {
  willChange: "visibility",
  color: "white",
});

globalStyle(`${menuButtonContent} p`, {
  margin: `${vh(0.5)} 0 ${vh(0.5)} 0`,
  display: "inline-block",
  fontSize: vh(1.75),
});
