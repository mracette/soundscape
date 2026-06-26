import { globalFontFace, globalStyle } from "@vanilla-extract/css";
import { hotBlue, hotGreen, hotPink, offBlack2, vh, vw } from "./settings";

globalFontFace("Lato", {
  fontStyle: "normal",
  fontWeight: 400,
  src: "local('Lato Regular'), local('Lato-Regular'), url('../fonts/lato-v16-latin-regular.eot?#iefix') format('embedded-opentype'), url('../fonts/lato-v16-latin-regular.woff2') format('woff2'), url('../fonts/lato-v16-latin-regular.woff') format('woff'), url('../fonts/lato-v16-latin-regular.ttf') format('truetype'), url('../fonts/lato-v16-latin-regular.svg#Lato') format('svg')",
});

globalFontFace("Satisfy", {
  fontStyle: "normal",
  fontWeight: 400,
  src: "local('Satisfy Regular'), local('Satisfy-Regular'), url('../fonts/satisfy-v10-latin-regular.eot?#iefix') format('embedded-opentype'), url('../fonts/satisfy-v10-latin-regular.woff2') format('woff2'), url('../fonts/satisfy-v10-latin-regular.woff') format('woff'), url('../fonts/satisfy-v10-latin-regular.ttf') format('truetype'), url('../fonts/satisfy-v10-latin-regular.svg#Satisfy') format('svg')",
});

globalStyle("html", {
  fontSize: "52.5%",
});

globalStyle("body", {
  fontFamily: "'Lato', Helvetica, sans-serif",
  fontWeight: "normal",
  backgroundColor: offBlack2,
});

globalStyle("canvas", {
  display: "block",
});

globalStyle("h1, h2, h3, h4, h5, h6", {
  fontWeight: "normal",
});

globalStyle("h2, h3", {
  color: "white",
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
  backgroundColor: "rgba(0,0,0,0)",
});

globalStyle(".off-black", {
  backgroundColor: offBlack2,
});

globalStyle(".front-most", {
  zIndex: 999,
});

globalStyle(".hot-pink", {
  color: hotPink,
});

globalStyle(".hot-green", {
  color: hotGreen,
});

globalStyle(".hot-blue", {
  color: hotBlue,
});

