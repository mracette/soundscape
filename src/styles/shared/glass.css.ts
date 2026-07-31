import { style, type ComplexStyleRule } from "@vanilla-extract/css";
import { glassLight, heroGradientStops, motion } from "../settings";

/**
 * CSS-only "liquid glass" material, in two intensities plus a frost-only
 * variant for bordered controls. Each full surface stacks:
 *
 * - the element itself: light frosted base (blur + saturate), a faint white
 *   body tint, and a diagonal specular sheen
 * - `::before`: a heavier frost masked by four per-side linear gradients
 *   (mask layers composite additively) so the blur ramps up progressively
 *   over a fixed pixel band hugging the element's shape — stands in for the
 *   refracting thick rim of real glass (no true displacement in CSS)
 * - `::after`: a 1px gradient hairline that catches light top-left and
 *   bottom-right, like an edge-lit pane
 *
 * Consumers own their border-radius (cards/panels/pills/circles differ); the
 * pseudo layers inherit it. Stacked glass composes naturally: a control's
 * backdrop-filter samples the already-frosted panel beneath it.
 *
 * The hairline mask uses the standard two-layer mask-composite trick
 * (content-box layer XOR'd against a full-box layer) so only the 1px band
 * renders. Safari needs the -webkit- prefixed mask properties; mask +
 * backdrop-filter on the same pseudo should be verified on a real WebKit
 * device.
 */

const frost = "blur(4px) saturate(1.5)";
const edgeFrost = "blur(16px) saturate(1.6) brightness(1.05)";

const subtleFrost = "blur(5px) saturate(1.4)";
const subtleEdgeFrost = "blur(12px) saturate(1.5) brightness(1.03)";

const controlFrost = "blur(10px) saturate(1.5)";

/** full frost at each edge fading to clear over a fixed band */
const edgeFade = ["to top", "to bottom", "to left", "to right"]
  .map((dir) => `linear-gradient(${dir}, #000 0px, transparent 16px)`)
  .join(", ");

const hairlineMask = {
  WebkitMask:
    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
  maskComposite: "exclude",
} as const;

const material = (body: string, edge: string): ComplexStyleRule => ({
  position: "relative",
  backgroundColor: glassLight.tint,
  backgroundImage: `linear-gradient(115deg, ${glassLight.sheen}, transparent 40%, transparent 75%, ${glassLight.rimFaint})`,
  backdropFilter: body,
  WebkitBackdropFilter: body,
  boxShadow: `0 12px 32px ${glassLight.shadow}`,
  selectors: {
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      pointerEvents: "none",
      backdropFilter: edge,
      WebkitBackdropFilter: edge,
      WebkitMask: edgeFade,
      mask: edgeFade,
    },
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      padding: "1px",
      pointerEvents: "none",
      backgroundImage: `linear-gradient(160deg, ${glassLight.rimBright}, ${glassLight.rimFaint} 30%, transparent 55%, ${glassLight.rimFaint} 80%, ${glassLight.rimMid})`,
      ...hairlineMask,
    },
  },
});

/** default material: standalone cards and surfaces stacked on a panel */
export const glass = style(material(frost, edgeFrost));

/** backdrop-panel material other glass sits on: same white tint, deeper blur */
export const glassSubtle = style(material(subtleFrost, subtleEdgeFrost));

/**
 * frost only, for controls that keep their own fill, white border, and white
 * hover glow (pills, radial-menu circles) — no sheen, hairline, or shadow
 */
export const glassControl = style({
  backdropFilter: controlFrost,
  WebkitBackdropFilter: controlFrost,
});

const orbFrost = "blur(12px) saturate(1.7)";
const orbEdgeFrost = "blur(24px) saturate(1.8) brightness(1.1)";

const orbEdgeFade = ["to top", "to bottom", "to left", "to right"]
  .map((dir) => `linear-gradient(${dir}, #000 0px, transparent 12px)`)
  .join(", ");

/**
 * Maxed-out borderless glass for the circular radial-menu buttons: an
 * off-center radial highlight, bottom-weighted inner shading, heavy edge
 * frost, and a bright hairline rim make the disc read as a 3D lens.
 */
/** the orb's off-center "light hitting a sphere" highlight */
export const orbHighlightImage = `radial-gradient(circle at 32% 28%, ${glassLight.highlight}, transparent 55%)`;

export const glassOrb = style({
  position: "relative",
  backgroundColor: glassLight.tint,
  backgroundImage: orbHighlightImage,
  backdropFilter: orbFrost,
  WebkitBackdropFilter: orbFrost,
  boxShadow: `inset 0 -10px 20px ${glassLight.innerShadeDeep}, inset 0 2px 6px ${glassLight.sheen}, 0 8px 24px ${glassLight.shadow}`,
  selectors: {
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      pointerEvents: "none",
      backdropFilter: orbEdgeFrost,
      WebkitBackdropFilter: orbEdgeFrost,
      WebkitMask: orbEdgeFade,
      mask: orbEdgeFade,
    },
    "&::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      padding: "1px",
      pointerEvents: "none",
      backgroundImage: `linear-gradient(160deg, ${glassLight.rimBright}, ${glassLight.rimFaint} 40%, transparent 60%, ${glassLight.rimMid})`,
      ...hairlineMask,
    },
  },
});

const heroRimImage = `linear-gradient(160deg, ${heroGradientStops.join(", ")})`;

/**
 * Hero-gradient rim recolors for a glass surface's hairline ring. Declared
 * after the surface tiers so the `::after` recolor wins. `heroRimActive` for
 * active/open states (in-app chrome); `heroRimHover` for hover/focus (the
 * landing song cards, matching their icons' hover gradient).
 */
export const heroRimActive = style({
  selectors: {
    "&::after": {
      backgroundImage: heroRimImage,
    },
  },
});

export const heroRimHover = style({
  selectors: {
    "&:hover::after, &:focus-visible::after": {
      backgroundImage: heroRimImage,
    },
  },
});

/** hover/focus body brighten for interactive full-material surfaces */
export const glassHover = style({
  transition: `background-color ${motion.fast} ${motion.ease}`,
  selectors: {
    "&:hover, &:focus-visible": {
      backgroundColor: glassLight.tintHover,
    },
  },
});
