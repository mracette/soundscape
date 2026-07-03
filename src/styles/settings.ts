export const lightGrey = "#d8d8d8";
export const offBlack = "#1f262f";
export const offBlack2 = "#141b24";

/**
 * An accent color and its derived treatments. Derivations trace back to the
 * base hex: glow is the base at 0.45 alpha, the gradient pair shifts
 * lightness only (~+10% / −15%) so hue and saturation stay recognizable.
 */
export interface AccentGroup {
  base: string;
  glow: string;
  gradientFrom: string;
  gradientTo: string;
}

/**
 * The UI accent palette ("light show" chrome). Global across scenes — scene
 * identity flows through the veil tint and the WebGL worlds, never through
 * per-scene accent swaps. Roles:
 * - ember: primary action, warmth, default interactive glow
 * - gold:  the lighting color (rims, particles, glow pulses); never a button fill
 * - moss:  affirmative / positive, botanical
 * - dusk:  informational / secondary, moonlit cool
 * - bloom: garden-gate crimson; sparing in-app emphasis
 */
export const accents = {
  ember: {
    base: "#ff8a5e",
    glow: "rgba(255, 138, 94, 0.45)",
    gradientFrom: "#ffa57e",
    gradientTo: "#e06f45",
  },
  gold: {
    base: "#f4d284",
    glow: "rgba(244, 210, 132, 0.45)",
    gradientFrom: "#f9e0a4",
    gradientTo: "#d9b568",
  },
  moss: {
    base: "#7ee2a4",
    glow: "rgba(126, 226, 164, 0.45)",
    gradientFrom: "#9cebb9",
    gradientTo: "#5fc487",
  },
  dusk: {
    base: "#8fb8ff",
    glow: "rgba(143, 184, 255, 0.45)",
    gradientFrom: "#aecbff",
    gradientTo: "#6f9be0",
  },
  bloom: {
    base: "#e56b8c",
    glow: "rgba(229, 107, 140, 0.45)",
    gradientFrom: "#ee8aa4",
    gradientTo: "#c94f72",
  },
} satisfies Record<string, AccentGroup>;

export const textPrimary = "#ffffff";
export const textSecondary = "rgba(255, 255, 255, 0.65)";

/**
 * Translucent dark fills for atmosphere-first surfaces (charcoal family at
 * varying weight) plus the shared hairline and raised-cluster treatments.
 */
export const surfaces = {
  veil: "rgba(20, 27, 36, 0.75)",
  button: "rgba(20, 27, 36, 0.6)",
  buttonHover: "rgba(31, 38, 47, 0.85)",
  chip: "rgba(20, 27, 36, 0.45)",
  raised: "rgba(255, 255, 255, 0.06)",
  hairline: "rgba(255, 255, 255, 0.15)",
};

/** pill: buttons/chips/controls; panel: veils/cards/modals; control: small nested surfaces */
export const radii = {
  pill: "999px",
  panel: "1.5rem",
  control: ".75rem",
};

/**
 * Soft, offset-free two-layer glow. Applied only to "live" elements (active,
 * hover, focus, the open menu button) — resting chrome never glows.
 */
export const glowShadow = (glow: string) => `0 0 8px ${glow}, 0 0 24px ${glow}`;

/** Durations/easing for UI transitions; slow is the ambient glow-pulse period. */
export const motion = {
  fast: "150ms",
  base: "250ms",
  slow: "1200ms",
  ease: "cubic-bezier(0.4, 0, 0.2, 1)",
};

export const sSize = "0.8rem";
export const mSize = "1.6rem";
export const lSize = "3.2rem";
export const xlSize = "4.8rem";
export const xxlSize = "10.5rem";

// mock viewport units for mobile corner cases
// see https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
export const vh = (quantity: number) => `calc(var(--vh, 1vh) * ${quantity})`;
export const vw = (quantity: number) => `calc(var(--vw, 1vw) * ${quantity})`;
