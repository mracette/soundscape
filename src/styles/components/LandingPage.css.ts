import { globalStyle, style } from "@vanilla-extract/css";
import {
  heroGradientStops,
  mSize,
  radii,
  surfaces,
  textPrimary,
  vw,
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
  fontSize: "13rem",
  fontWeight: 400,
  margin: 0,
  padding: "2rem",
  color: textPrimary,
  // `background` must come before `background-clip` in this stylesheet
  background: `linear-gradient(30deg, ${heroGradientStops.join(", ")})`,
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  "@media": {
    "screen and (max-width: 670px)": {
      fontSize: "7.5rem",
    },
  },
});

export const landingPageTitleHero = style({
  position: "relative",
  display: "inline-flex",
});

export const landingPageTitleSpill = style({
  position: "absolute",
  top: "65%",
  left: "50%",
  transform: "translate(-50%, -50%) rotate(17deg) scale(1.2)",
  width: "135%",
  maxWidth: "none",
  opacity: 0.55,
  pointerEvents: "none",
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
});

globalStyle(`${landingPageHeader} .flex-row`, {
  justifyContent: "center",
});

export const landingPage = style({
  // x stays hidden regardless of which overflow rule wins the cascade against
  // `.fullscreen`: the title spill overhangs the title by design and must
  // never create horizontal scroll
  overflowX: "hidden",
  overflowY: "auto",
});

export const songCardList = style({
  width: vw(90),
  // two 300px cards plus the gap: desktop wraps to a 2x2 grid
  maxWidth: "616px",
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
  width: "300px",
  borderRadius: radii.panel,
  background: surfaces.chip,
  selectors: {
    "&:hover, &:focus-visible": {
      background: surfaces.buttonHover,
    },
  },
  "@media": {
    "screen and (max-width: 670px)": {
      // fixed width clamped by the container: width:100% + maxWidth leaves
      // zero free space for centering (margins resolve before the clamp)
      width: "320px",
      maxWidth: "100%",
      margin: "1rem 0",
    },
  },
});

export const songCardName = style({
  fontSize: "2rem",
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

export const innerLandingPage = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
});
