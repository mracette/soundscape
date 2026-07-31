import { globalStyle, style } from "@vanilla-extract/css";
import {
  radii,
  textPrimary,
  textSecondary,
  typeRamp,
  vh,
  vw,
} from "../settings";

export const landingPageCanvas = style({
  zIndex: -1,
});

export const landingPageTitleWrapper = style({
  // proportional so the block sits near optical centre on a tall desktop
  // window without being driven off the fold on a short one
  paddingTop: vh(15),
  "@media": {
    "screen and (max-width: 670px)": {
      paddingTop: "3rem",
    },
  },
});

export const landingPageTitle = style({
  fontFamily: "'Kaushan Script'",
  // "Soundscape" in Kaushan sets about 4.75x its font size wide, so a fixed
  // 13rem clips on the narrowest phones. The vw term keeps the wordmark inside
  // the frame until the 13rem cap takes over above ~610px.
  fontSize: `min(13rem, ${vw(18)})`,
  fontWeight: 400,
  margin: 0,
  padding: "2rem",
  color: textPrimary,
});

export const landingPageHeader = style({
  fontSize: typeRamp.bodyCompact.fontSize,
  color: textPrimary,
  display: "flex",
  flexDirection: "column",
  width: "100%",
  // min rather than a fixed height: on a short viewport the cards run past the
  // fold, and only a header that grows with them gives the scroller something
  // taller than itself to scroll
  minHeight: "100%",
  justifyContent: "flex-start",
  alignItems: "center",
});

globalStyle(`${landingPageHeader} .flex-row`, {
  justifyContent: "center",
});

/**
 * Fills the viewport itself instead of borrowing `.fullscreen`, whose
 * `overflow: hidden` is emitted after this rule and would win, leaving the
 * page unscrollable. x stays hidden so nothing can scroll sideways.
 */
export const landingPage = style({
  position: "absolute",
  top: 0,
  left: 0,
  width: vw(100),
  height: vh(100),
  overflowY: "auto",
  overflowX: "hidden",
});

export const songCardList = style({
  width: vw(90),
  // two cards plus the gap: desktop wraps to a 2x2 grid
  maxWidth: "656px",
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "flex-start",
  alignContent: "flex-start",
  marginTop: "2rem",
  gap: 16,
  "@media": {
    "screen and (max-width: 670px)": {
      width: "100%",
      flexDirection: "column",
      // wrap + alignContent:flex-start from the base style would pack the
      // column line to the left, defeating alignItems centering
      flexWrap: "nowrap",
      alignItems: "center",
      marginTop: 0,
      gap: 0,
    },
  },
});

export const songCard = style({
  textDecoration: "none",
  display: "block",
  // one card size everywhere: the desktop grid used to run narrower than the
  // phone layout, which left the cards looking undersized on a big screen
  // fixed width clamped by the container: width:100% + maxWidth leaves
  // zero free space for centering (margins resolve before the clamp)
  width: "320px",
  maxWidth: "100%",
  borderRadius: radii.panel,
  "@media": {
    "screen and (max-width: 670px)": {
      margin: "1rem 0",
    },
  },
});

export const songCardName = style({
  fontSize: typeRamp.cardTitle.fontSize,
  fontWeight: typeRamp.cardTitle.fontWeight,
});

export const songCardMeta = style({
  ...typeRamp.caption,
  color: textSecondary,
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
  fontSize: typeRamp.display.fontSize,
  fontWeight: typeRamp.display.fontWeight,
  marginBottom: "4rem",
  textTransform: "none",
  maxWidth: "375px",
  textWrap: "wrap",
  textAlign: "center",
});

export const infoPageButton = style({
  fontSize: typeRamp.bodyCompact.fontSize,
  width: "140px",
});

export const innerLandingPage = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
  // keeps the last card clear of the bottom edge once the page scrolls
  paddingBottom: "4rem",
});

// the global span/p rule sets the reading size, which is a step small for the
// one line introducing the page. Centred because it wraps on narrow viewports,
// where the flex centring alone leaves a ragged left edge.
globalStyle(`${innerLandingPage}>p`, {
  fontSize: typeRamp.lede.fontSize,
  fontWeight: typeRamp.lede.fontWeight,
  textAlign: "center",
});
