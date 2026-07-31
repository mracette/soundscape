import { globalStyle, style } from "@vanilla-extract/css";
import { textPrimary, typeRamp } from "../settings";
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
  color: textPrimary,
});

// rows never wrap on desktop-width panels; on narrow screens wrapping keeps
// pill rows and control clusters inside the panel instead of clipping
globalStyle(`${menuButtonContent} .flex-row`, {
  flexWrap: "wrap",
});

globalStyle(`${menuButtonContent} p`, {
  fontSize: typeRamp.panelBody.fontSize,
});
