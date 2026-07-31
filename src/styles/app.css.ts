import { globalFontFace, globalStyle } from "@vanilla-extract/css";
import { fontBody, offBlack2, textPrimary, typeRamp, vh, vw } from "./settings";

globalFontFace("Quicksand", {
  fontStyle: "normal",
  fontWeight: "300 700",
  fontDisplay: "swap",
  src: "url('../fonts/Quicksand-Variable.woff2') format('woff2')",
});

globalFontFace("Kaushan Script", {
  fontStyle: "normal",
  fontWeight: 400,
  fontDisplay: "swap",
  src: "url('../fonts/KaushanScript-Regular.woff2') format('woff2')",
});

globalStyle("html", {
  fontSize: "52.5%",
});

globalStyle("body", {
  fontFamily: fontBody,
  fontWeight: typeRamp.body.fontWeight,
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
  fontSize: typeRamp.panelTitle.fontSize,
  fontWeight: typeRamp.panelTitle.fontWeight,
  margin: `0 0 ${vh(1)} 0`,
});

globalStyle("h3", {
  fontSize: typeRamp.sectionHeading.fontSize,
  fontWeight: typeRamp.sectionHeading.fontWeight,
  margin: 0,
  padding: `0 ${vh(1)} 0 0`,
  flex: "0 0 content",
  whiteSpace: "nowrap",
});

globalStyle("a", {
  color: "inherit",
});

globalStyle("span, p", {
  marginBlockStart: vh(0),
  marginBottom: vh(1.5),
});

globalStyle("span, p", {
  fontSize: typeRamp.body.fontSize,
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
