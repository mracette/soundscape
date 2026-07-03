import { globalStyle, style } from "@vanilla-extract/css";
import {
  hotBlue,
  hotGreen,
  hotPink,
  liveGlowSelectors,
  mSize,
  motion,
  radii,
  surfaces,
  textPrimary,
  vw,
  whiteGlow,
  xxlSize,
} from "../settings";

export const landingPageCanvas = style({
  zIndex: -1,
});

export const landingPageTitleWrapper = style({
  paddingTop: "10rem",
  "@media": {
    "screen and (max-width: 670px)": {
      paddingTop: "3rem",
    },
  },
});

export const landingPageTitle = style({
  fontFamily: "'Satisfy'",
  fontSize: xxlSize,
  fontWeight: 400,
  margin: 0,
  padding: "2rem",
  color: textPrimary,
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

export const landingPageHeader = style({
  fontSize: mSize,
  color: textPrimary,
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  justifyContent: "flex-start",
  alignItems: "center",
  gap: "0.5rem",
});

globalStyle(`${landingPageHeader} .flex-row`, {
  justifyContent: "center",
});

export const landingPage = style({
  overflow: "auto",
});

export const landingPageSongTitle = style({
  color: hotPink,
});

export const landingPageBpm = style({
  color: hotGreen,
});

export const landingPageKey = style({
  color: hotBlue,
});

export const songSelectionPanel = style({
  width: vw(75),
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "flex-start",
  alignContent: "flex-start",
  marginTop: "2rem",
});

export const songLink = style({
  borderRadius: "50%",
  background: surfaces.chip,
  transition: `box-shadow ${motion.fast} ${motion.ease}`,
  selectors: liveGlowSelectors(whiteGlow),
});

export const songLinkMobile = style({
  textDecoration: "none",
  maxWidth: "320px",
  display: "block",
  borderRadius: radii.panel,
  width: "100%",
  margin: "1rem 0",
  background: surfaces.chip,
  transition: `box-shadow ${motion.fast} ${motion.ease}`,
  selectors: liveGlowSelectors(whiteGlow),
});

globalStyle(`${songLinkMobile}>div`, {
  flexBasis: "50%",
});

export const infoRow = style({
  marginBottom: "1.5rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

globalStyle(`${infoRow}>p`, {
  textAlign: "center",
});

export const infoSubheader = style({
  fontSize: "3rem",
  marginBottom: "4rem",
  textTransform: "none",
  maxWidth: "375px",
  textWrap: "wrap",
  textAlign: "center",
});

export const infoPageButton = style({
  fontSize: mSize,
  width: "140px",
});
