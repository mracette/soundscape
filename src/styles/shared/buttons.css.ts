import { globalStyle, style } from "@vanilla-extract/css";
import { easeOrganic, pillRadius, vh } from "../settings";

export const buttonWhite = style({
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

export const groupedButtons = style({
  flex: "1 1 auto",
  borderTopWidth: vh(0.2),
  borderBottomWidth: vh(0.2),
  borderLeftWidth: vh(0.1),
  borderRightWidth: vh(0.1),
  selectors: {
    "&:first-of-type": {
      borderLeftWidth: vh(0.2),
    },
    "&:last-of-type": {
      borderRightWidth: vh(0.2),
    },
  },
});

// Pill-shaped button for panel content (HomePanel, EffectsPanel). Kept
// separate from buttonWhite/groupedButtons above — those are also used by
// LandingPage and ToggleButtonPanel, which are untouched by this pass.
export const pillButton = style({
  fontSize: vh(1.75),
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.22)",
  borderRadius: pillRadius,
  color: "white",
  padding: `${vh(1)} ${vh(2.5)}`,
  margin: `0 ${vh(0.5)}`,
  flexBasis: "auto",
  flexGrow: 1,
  transitionProperty: "box-shadow, border-color",
  transitionDuration: "200ms",
  transitionTimingFunction: easeOrganic,
  selectors: {
    "&:first-of-type": { marginLeft: 0 },
    "&:last-of-type": { marginRight: 0 },
  },
});

globalStyle(`${pillButton}:hover:not(:disabled)`, {
  boxShadow: "0 0 12px rgba(255, 255, 255, 0.18)",
  borderColor: "rgba(255, 255, 255, 0.5)",
});

globalStyle(`${pillButton}:disabled`, {
  opacity: 0.4,
  cursor: "default",
});
