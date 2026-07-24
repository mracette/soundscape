import { globalStyle, style } from "@vanilla-extract/css";
import { mSize, radii, surfaces, textPrimary, vw } from "../settings";

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
  margin: 0,
  padding: "2rem",
  lineHeight: 0,
});

export const landingPageTitleArt = style({
  display: "block",
  width: "95rem",
  maxWidth: "92vw",
  // the art lives on a solid black plate; screen blending drops the plate
  // into the night sky while letting stars show through its dark regions
  mixBlendMode: "screen",
  "@media": {
    "screen and (max-width: 670px)": {
      width: "54rem",
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
});

globalStyle(`${landingPageHeader} .flex-row`, {
  justifyContent: "center",
});

export const landingPage = style({
  // x stays hidden regardless of which overflow rule wins the cascade against
  // `.fullscreen`: the page only ever scrolls vertically, and sub-pixel
  // overhang from the near-full-width title art must not add a horizontal bar
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
