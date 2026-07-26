import { globalFontFace, globalStyle } from "@vanilla-extract/css";
import { offBlack2, textPrimary, vh, vw } from "./settings";

globalFontFace("Outfit", {
  fontStyle: "normal",
  fontWeight: "100 900",
  fontDisplay: "swap",
  src: "url('../fonts/Outfit-Variable.woff2') format('woff2')",
});

globalStyle("html", {
  fontSize: "52.5%",
});

globalStyle("body", {
  fontFamily: "'Outfit', Helvetica, sans-serif",
  fontWeight: 300,
  letterSpacing: "0.02em",
  backgroundColor: offBlack2,
});

globalStyle("canvas", {
  display: "block",
});

globalStyle("h1, h2, h3, h4, h5, h6", {
  fontWeight: "normal",
});

globalStyle("h2, h3", {
  color: textPrimary,
  textTransform: "capitalize",
});

globalStyle("h2", {
  fontSize: vh(3),
  margin: `0 0 ${vh(1)} 0`,
});

globalStyle("h3", {
  fontSize: vh(2.25),
  margin: 0,
  padding: `0 ${vh(1)} 0 0`,
  flex: "0 0 content",
  whiteSpace: "nowrap",
});

globalStyle("a", {
  color: "inherit",
});

globalStyle("span, p", {
  fontSize: "1.75rem",
});

globalStyle("button, .button", {
  cursor: "pointer",
});

globalStyle("button:focus", {
  outline: "none",
});

globalStyle(".flex-row", {
  width: "100%",
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-start",
  alignItems: "center",
});

globalStyle(".flex-col", {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "flex-start",
});

globalStyle(".fullscreen", {
  position: "absolute",
  overflow: "hidden",
  top: 0,
  left: 0,
  margin: 0,
  width: vw(100),
  height: vh(100),
});

globalStyle(".transparent", {
  backgroundColor: "transparent",
});

globalStyle(".off-black", {
  backgroundColor: offBlack2,
});

globalStyle(".front-most", {
  zIndex: 999,
});

