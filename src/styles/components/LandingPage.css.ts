import { globalStyle } from "@vanilla-extract/css";
import {
  fontColor,
  hotBlue,
  hotGreen,
  hotPink,
  mSize,
  moonYellow,
  vw,
  xxlSize,
} from "../settings";

globalStyle("#landing-page-canvas", {
  zIndex: -1,
});

globalStyle("#landing-page-soundscape-title-wrapper", {
  paddingTop: "10rem",
  "@media": {
    "screen and (max-width: 670px)": {
      paddingTop: "3rem",
    },
  },
});

globalStyle("#landing-page-soundscape-title", {
  fontFamily: "'Satisfy'",
  fontSize: xxlSize,
  fontWeight: 400,
  margin: 0,
  padding: "2rem",
  color: fontColor,
  // `background` must come before `background-clip` in this stylesheet
  background:
    "linear-gradient(30deg, #feac5e, #f3a280, #e7979b, #db8cb2, #ce80c7, #be8ad4, #aaa6dc, #94bfe4, #7ad4eb, #59e8f2)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  "@media": {
    "screen and (max-width: 670px)": {
      fontSize: "7.5rem",
    },
  },
});

globalStyle(".landing-page-header", {
  fontSize: mSize,
  color: fontColor,
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  justifyContent: "flex-start",
  alignItems: "center",
  gap: "0.5rem",
});

globalStyle(".landing-page-header .flex-row", {
  justifyContent: "center",
});

globalStyle("#landing-page", {
  overflow: "auto",
});

globalStyle("#landing-page-song-title", {
  color: hotPink,
});

globalStyle("#landing-page-bpm", {
  color: hotGreen,
});

globalStyle("#landing-page-key", {
  color: hotBlue,
});

globalStyle(".filler", {
  display: "inline-block",
  width: "100%",
  height: "25rem",
});

globalStyle(".mobile-song-icon-wrapper", {
  borderColor: moonYellow,
  borderWidth: "1px",
  borderStyle: "solid",
  borderBottomWidth: "0px",
});

globalStyle("#song-selection-panel", {
  width: vw(75),
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "flex-start",
  alignContent: "flex-start",
  marginTop: "2rem",
});

globalStyle(".song-link", {
  borderRadius: "50%",
});

globalStyle(".song-link:hover", {
  backgroundColor: "rgba(255,255,255,.05)",
  backdropFilter: "blur(3px)",
});

globalStyle(".song-link-mobile", {
  textDecoration: "none",
  maxWidth: "320px",
  display: "block",
  borderRadius: "1rem",
  width: "100%",
  margin: "1rem 0",
});

globalStyle(".song-link-mobile>div", {
  flexBasis: "50%",
});

globalStyle(".song-link-mobile:hover", {
  backgroundColor: "rgba(255,255,255,.05)",
  backdropFilter: "blur(3px)",
});

globalStyle(".info-row", {
  marginBottom: "1.5rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

globalStyle(".info-row>p", {
  textAlign: "center",
});

globalStyle(".info-subheader", {
  fontSize: "3rem",
  marginBottom: "4rem",
  textTransform: "none",
  maxWidth: "375px",
  textWrap: "wrap",
  textAlign: "center",
});

globalStyle(".info-page-button", {
  fontSize: mSize,
  borderRadius: "4px",
  width: "140px",
});

globalStyle(".info-page-button:hover", {
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  transitionDuration: "250ms",
});

globalStyle("span,p", {
  fontSize: "1.75rem",
});
