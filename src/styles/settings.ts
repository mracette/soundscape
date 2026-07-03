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
const rgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const accentGroup = (
  base: string,
  gradientFrom: string,
  gradientTo: string
): AccentGroup => ({
  base,
  glow: rgba(base, 0.45),
  gradientFrom,
  gradientTo,
});

export const accents = {
  ember: accentGroup("#ff8a5e", "#ffa57e", "#e06f45"),
  gold: accentGroup("#f4d284", "#f9e0a4", "#d9b568"),
  moss: accentGroup("#7ee2a4", "#9cebb9", "#5fc487"),
  dusk: accentGroup("#8fb8ff", "#aecbff", "#6f9be0"),
  bloom: accentGroup("#e56b8c", "#ee8aa4", "#c94f72"),
} satisfies Record<string, AccentGroup>;

/**
 * An accent's glow color at a non-default alpha (pressed states, dim pulse
 * phases). Alpha is a real parameter here — never derive variants by editing
 * the baked `glow` string.
 */
export const accentGlow = (accent: AccentGroup, alpha: number) =>
  rgba(accent.base, alpha);

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

/** Selector block for the standard "live element" hover/focus glow. */
export const liveGlowSelectors = (glow: string) => ({
  "&:hover, &:focus-visible": { boxShadow: glowShadow(glow) },
});

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
