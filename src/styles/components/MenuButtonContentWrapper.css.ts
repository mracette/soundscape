import { globalStyle, style } from "@vanilla-extract/css";
import { glassNoiseTexture, panelRadius, vh } from "../settings";

export const menuButtonContent = style({
  visibility: "visible",
  borderRadius: `${panelRadius} ${panelRadius}`,
  position: "absolute",
  width: "auto",
  backgroundImage: `linear-gradient(160deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)), ${glassNoiseTexture}`,
  backgroundBlendMode: "overlay",
  border: "1px solid rgba(255, 255, 255, 0.14)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
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
