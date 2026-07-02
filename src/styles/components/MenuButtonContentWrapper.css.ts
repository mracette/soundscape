import { globalStyle, style } from "@vanilla-extract/css";
import { glassNoiseTexture, panelRadius, vh } from "../settings";

export const menuButtonContent = style({
  visibility: "visible",
  borderRadius: `${panelRadius} ${panelRadius}`,
  position: "absolute",
  width: "auto",
  // Three layered fake-glass techniques, none of them a real backdrop-filter
  // blur: a diagonal sheen (glare catching the pane), a fine grain blended
  // with `overlay` so it reads as frosted texture rather than flat static,
  // and an inset highlight/shadow pair on the box-shadow below (light
  // catching the top edge, shadow suggesting glass thickness at the bottom).
  backgroundImage: `${glassNoiseTexture}, linear-gradient(115deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.02) 28%, rgba(255, 255, 255, 0.02) 72%, rgba(255, 255, 255, 0.1) 100%)`,
  backgroundBlendMode: "overlay, normal",
  border: "1px solid rgba(255, 255, 255, 0.22)",
  boxShadow:
    "inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 0 rgba(0, 0, 0, 0.25), 0 8px 32px rgba(0, 0, 0, 0.35)",
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
