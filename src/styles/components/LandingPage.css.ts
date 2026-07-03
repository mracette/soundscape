import { globalStyle, style, styleVariants } from "@vanilla-extract/css";
import {
  accents,
  fontColor,
  glowShadow,
  mSize,
  motion,
  vw,
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
  color: fontColor,
  // `background` must come before `background-clip` in this stylesheet.
  // Ember → gold → bloom: the garden-gate sunset, in the accent palette.
  background: `linear-gradient(30deg, ${accents.ember.base}, ${accents.gold.base}, ${accents.bloom.base})`,
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
  color: fontColor,
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
  color: accents.ember.base,
});

export const landingPageBpm = style({
  color: accents.moss.base,
});

export const landingPageKey = style({
  color: accents.dusk.base,
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
  background: "rgba(20, 27, 36, 0.45)",
  transition: `box-shadow ${motion.fast} ${motion.ease}`,
});

/**
 * Hover/focus glow on each scene selector nods at that scene's color —
 * the one place a per-scene accent is deliberate. The icon canvas artwork
 * itself is untouched.
 */
const songLinkGlowVariant = (glow: string) => ({
  selectors: {
    "&:hover, &:focus-visible": {
      boxShadow: glowShadow(glow),
    },
  },
});

export const songLinkGlow = styleVariants({
  swamp: songLinkGlowVariant(accents.moss.glow),
  mornings: songLinkGlowVariant(accents.ember.glow),
  moonrise: songLinkGlowVariant(accents.dusk.glow),
  "coming-soon": songLinkGlowVariant(accents.gold.glow),
});

export const songLinkMobile = style({
  textDecoration: "none",
  maxWidth: "320px",
  display: "block",
  borderRadius: "1rem",
  width: "100%",
  margin: "1rem 0",
  background: "rgba(20, 27, 36, 0.45)",
  transition: `box-shadow ${motion.fast} ${motion.ease}`,
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
