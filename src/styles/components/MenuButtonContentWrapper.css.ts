import { globalStyle } from "@vanilla-extract/css";
import { moonYellow, vh } from "../settings";

globalStyle(".menu-button-content *", {
  willChange: "visibility",
  color: "white",
});

globalStyle(".menu-button-content p", {
  margin: `${vh(0.5)} 0 ${vh(0.5)} 0`,
  display: "inline-block",
  fontSize: vh(1.75),
});

globalStyle(".menu-button-content", {
  visibility: "visible",
  borderRadius: ".75rem .75rem",
  position: "absolute",
  width: "auto",
  background: "rgba(255, 255, 255, 0.15)",
  overflow: "auto",
});

globalStyle(".flex-panel", {
  display: "flex",
  flexDirection: "column",
  flexWrap: "nowrap",
  flex: "1 1 auto",
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

globalStyle(".button-white", {
  fontSize: vh(1.75),
  backgroundColor: "rgba(255, 255, 255, 0)",
  borderStyle: "solid",
  borderColor: "white",
  color: "white",
  padding: vh(1),
  margin: "0 auto 0 auto",
  flexBasis: "auto",
  flexGrow: 1,
});

globalStyle(".button-yellow", {
  fontSize: vh(1.75),
  backgroundColor: "rgba(255, 255, 255, 0)",
  borderStyle: "solid",
  borderColor: moonYellow,
  color: moonYellow,
  padding: vh(1),
  margin: "0 auto 0 auto",
  flexBasis: "auto",
  flexGrow: 1,
});

globalStyle(".grouped-buttons", {
  flex: "1 1 auto",
  borderTopWidth: vh(0.2),
  borderBottomWidth: vh(0.2),
  borderLeftWidth: vh(0.1),
  borderRightWidth: vh(0.1),
});

globalStyle(".grouped-buttons:first-of-type", {
  borderLeftWidth: vh(0.2),
});

globalStyle(".grouped-buttons:last-of-type", {
  borderRightWidth: vh(0.2),
});
