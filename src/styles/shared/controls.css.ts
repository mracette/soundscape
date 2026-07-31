import { style } from "@vanilla-extract/css";

import { glassLight, hotGreen, radii, surfaces, vh } from "../settings";
import { glassOrb } from "./glass.css";

/**
 * The two parts every value control is built from — sliders and switches
 * alike: a recessed channel, and a glass lens that rides in it. A switch is
 * just a slider with two stops, so both share these sizes as well as the
 * material, and read as one family with the buttons.
 */

export const lensSize = vh(3);
export const channelHeight = vh(1);

/** the channel: frosted, with a shaded lip and rim so it reads sunken */
export const glassChannel = style({
  position: "relative",
  borderRadius: radii.pill,
  backgroundColor: surfaces.raised,
  backdropFilter: "blur(8px) saturate(1.4)",
  WebkitBackdropFilter: "blur(8px) saturate(1.4)",
  boxShadow: `inset 0 1px 2px ${glassLight.innerShadeDeep}, inset 0 0 0 1px ${glassLight.rimFaint}`,
});

/**
 * The live side of a channel, lit along its top edge like a liquid. Plain
 * declarations rather than a class: the switch reaches it through `:checked`,
 * where there is no class to compose.
 */
export const accentFill = {
  backgroundColor: hotGreen,
  backgroundImage: `linear-gradient(180deg, ${glassLight.highlight}, transparent 60%)`,
} as const;

/** the lens: a glass orb with the menu button's shading scaled down to knob size */
export const glassLens = style([
  glassOrb,
  {
    borderRadius: "50%",
    // brighter than the orb's resting tint: a knob has to read against both
    // the frosted channel and the accent fill
    backgroundColor: glassLight.tintHover,
    boxShadow: `inset 0 -4px 8px ${glassLight.innerShadeDeep}, inset 0 1px 3px ${glassLight.sheen}, 0 3px 10px ${glassLight.shadow}`,
  },
]);
