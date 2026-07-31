import { createVar, style } from "@vanilla-extract/css";

import { glassLight, motion, radii, vh } from "../settings";
import {
  accentFill,
  channelHeight,
  glassChannel,
  glassLens,
  lensSize,
} from "../shared/controls.css";

/**
 * Glass slider: the shared channel with an accent fill, and a lens for a thumb.
 *
 * The thumb travels between the channel's ends rather than its edges, so it
 * never overhangs the track, while the fill's edge tracks the thumb
 * proportionally — level with its near edge at the bottom of the range and its
 * far edge at the top, so the channel reads full at the maximum.
 *
 * Lens and channel sizes are custom properties so a variant can rescale the
 * whole control in one place; the thumb-travel calc in Slider.tsx reads the
 * lens var too, so it stays correct at any scale.
 */

export const lensVar = createVar();
export const channelVar = createVar();

export const sliderRoot = style({
  vars: { [lensVar]: lensSize, [channelVar]: channelHeight },
  position: "relative",
  display: "flex",
  alignItems: "center",
  flex: "1 1 0",
  width: "100%",
  height: `calc(${lensVar} + ${vh(0.6)})`,
  cursor: "ew-resize",
  touchAction: "none",
  outline: "none",
});

/** secondary sliders (More FX): same anatomy at a reduced scale */
export const sliderCompact = style({
  vars: { [lensVar]: vh(2.4), [channelVar]: vh(0.75) },
});

/** dragging: set on the root so the thumb and fill can drop their easing */
export const sliderDragging = style({});

export const sliderTrack = style([
  glassChannel,
  {
    width: "100%",
    height: channelVar,
    overflow: "hidden",
  },
]);

export const sliderFill = style({
  position: "absolute",
  top: 0,
  bottom: 0,
  borderRadius: radii.pill,
  ...accentFill,
  transition: `left ${motion.base} ${motion.ease}, right ${motion.base} ${motion.ease}`,
  selectors: {
    [`${sliderDragging} &`]: {
      transition: "none",
    },
  },
});

export const sliderThumb = style([
  glassLens,
  {
    position: "absolute",
    top: 0,
    bottom: 0,
    margin: "auto 0",
    width: lensVar,
    height: lensVar,
    // the root owns every pointer interaction, including presses on the thumb
    pointerEvents: "none",
    transition: `left ${motion.base} ${motion.ease}, transform ${motion.fast} ${motion.ease}, background-color ${motion.fast} ${motion.ease}`,
    selectors: {
      [`${sliderRoot}:hover &, ${sliderRoot}:focus-visible &`]: {
        backgroundColor: glassLight.tintActive,
      },
      [`${sliderRoot}:focus-visible &`]: {
        outline: `2px solid ${glassLight.rimMid}`,
        outlineOffset: "2px",
      },
      [`${sliderDragging} &`]: {
        backgroundColor: glassLight.tintActive,
        transform: "scale(1.12)",
        transition: `transform ${motion.fast} ${motion.ease}, background-color ${motion.fast} ${motion.ease}`,
      },
    },
  },
]);
