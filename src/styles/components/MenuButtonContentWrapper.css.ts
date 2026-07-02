import { globalStyle, style } from "@vanilla-extract/css";
import { panelRadius, vh } from "../settings";

export const menuButtonContent = style({
  visibility: "visible",
  borderRadius: `${panelRadius} ${panelRadius}`,
  position: "absolute",
  width: "auto",
  // Stays translucent (backgroundColor is set per-scene via contentPanelColor
  // in MenuButtonContentWrapper.tsx) so the WebGL scene behind the panel
  // stays visible while it's open — no glass-material simulation (no noise,
  // no sheen, no fake edge-lit-glass highlight), just a soft glow border.
  border: "1px solid rgba(255, 255, 255, 0.22)",
  boxShadow: "0 0 24px rgba(255, 255, 255, 0.08), 0 8px 32px rgba(0, 0, 0, 0.35)",
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
