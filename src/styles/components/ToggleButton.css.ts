import { style } from "@vanilla-extract/css";
import { glassLight, textPrimary, vh } from "../settings";
import { glassOrb, orbHighlightImage } from "../shared/glass.css";

/**
 * Voice toggles read state through whiteness: stopped rests at the standard
 * glass tint with the highlight suppressed; playing gets the bright fill and
 * the orb highlight. (No hero-gradient rim here — that's for chrome active
 * states.)
 */
export const toggleButton = style([
  glassOrb,
  {
    position: "relative",
    borderRadius: "50%",
    border: "none",
    padding: 0,
    overflowWrap: "break-word",
    backgroundColor: glassLight.tint,
    backgroundImage: "none",
    zIndex: 99,
    marginRight: vh(3),
    cursor: "pointer",
    selectors: {
      "&:focus": {
        outline: "none",
      },
      "&:last-child": {
        marginRight: 0,
      },
    },
  },
]);

/** playing: restore the orb highlight; gsap owns the fill color itself */
export const toggleButtonActive = style({
  backgroundColor: glassLight.tintActive,
  backgroundImage: orbHighlightImage,
});

/**
 * The stopped-state / boundary-countdown ring. Solid white for visibility —
 * this ring carries real state information.
 */
export const svgCircle = style({
  position: "absolute",
  display: "inline",
  top: 0,
  left: 0,
  fillOpacity: 0,
  stroke: textPrimary,
  // butt caps: round caps leave a 1px dot when the ring rests fully swept
  strokeLinecap: "butt",
  transformOrigin: "50% 50%",
});
