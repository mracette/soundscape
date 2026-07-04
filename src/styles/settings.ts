export const lightGrey = "#d8d8d8";
export const offBlack = "#1f262f";
export const offBlack2 = "#141b24";

/**
 * The accent quartet — the brand signature. Used strictly as accents (text
 * highlights, live-state labels, the active side of a slider), never as
 * per-button colors. Interactive glows are always white (`whiteGlow`).
 */
export const hotPink = "rgb(255, 76, 122)";
export const hotGreen = "rgb(0, 225, 158)";
export const hotBlue = "rgb(0, 249, 255)";
export const moonYellow = "#f6f2d5";

/** The one interactive glow color — every hover/focus glow is white. */
export const whiteGlow = "rgba(255, 255, 255, 0.45)";

/**
 * Sunset-to-cyan sweep behind the hero wordmark. Also drawn along each
 * element of the song icons on hover (see heroGradient.ts).
 */
export const heroGradientStops = [
  "#feac5e",
  "#f3a280",
  "#e7979b",
  "#db8cb2",
  "#ce80c7",
  "#be8ad4",
  "#aaa6dc",
  "#94bfe4",
  "#7ad4eb",
  "#59e8f2",
];

/**
 * Accents sampled from the hero gradient (warm start, midpoint, cool end)
 * for text that sits alongside it — e.g. the landing song-meta line, which
 * reads left-to-right as the same sweep.
 */
export const heroWarm = heroGradientStops[0];
export const heroMid = heroGradientStops[Math.floor(heroGradientStops.length / 2)];
export const heroCool = heroGradientStops[heroGradientStops.length - 1];

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
