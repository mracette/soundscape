export const lightGrey = "#d8d8d8";
export const offBlack = "#1f262f";
export const offBlack2 = "#141b24";

/**
 * The accent quartet — the brand signature. Used strictly as accents (text
 * highlights, live-state labels, the active side of a slider), never as
 * per-button colors. Interactive feedback is the glass body brightening
 * (`glassLight.tintHover`), not glows or outlines.
 */
export const hotPink = "rgb(255, 76, 122)";
export const hotGreen = "rgb(0, 225, 158)";
export const hotBlue = "rgb(0, 249, 255)";
export const moonYellow = "#f6f2d5";

/**
 * Candidate palette under exploration, generated with Color Curves. The share
 * link persists all generator parameters:
 * https://colorcurves.app/#p=AQQFDdv3pQE8AU_poP_vBg3a96cKxvgh_n8H8AENuwJXBfP6nwQ4Aw79DST-yvheBcD-AAAAAA0AAHMSAAAAAJkBewANLAYuGG7-cv5OAkkCDW4LSRvk_V7_LwKoAA2YFfwYpvq4AXACN_8NACAnEgAAAAAAAAAA&m=c&n=8
 */
export const colorCurvesStops = [
  "#419b64",
  "#60c95c",
  "#b6db58",
  "#e2d25f",
  "#e2bd83",
  "#d9a99f",
  "#b194b3",
  "#7680b8",
];

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

export const textPrimary = "#ffffff";
export const textSecondary = "rgba(255, 255, 255, 0.65)";

/** bread-and-butter UI type (variable, 300-700) */
export const fontBody = "'Quicksand', Helvetica, sans-serif";


/**
 * Translucent dark fills for atmosphere-first surfaces (charcoal family at
 * varying weight) plus the shared hairline and raised-cluster treatments.
 */
export const surfaces = {
  raised: "rgba(255, 255, 255, 0.06)",
  hairline: "rgba(255, 255, 255, 0.15)",
};

/**
 * White-alpha and shadow steps for the CSS glass material (glass.css.ts):
 * body tint, rim-hairline gradient stops, specular sheen, drop shadow.
 */
export const glassLight = {
  tint: "rgba(255, 255, 255, 0.03)",
  tintHover: "rgba(255, 255, 255, 0.09)",
  tintActive: "rgba(255, 255, 255, 0.32)",
  sheen: "rgba(255, 255, 255, 0.06)",
  highlight: "rgba(255, 255, 255, 0.22)",
  rimBright: "rgba(255, 255, 255, 0.5)",
  rimMid: "rgba(255, 255, 255, 0.28)",
  rimFaint: "rgba(255, 255, 255, 0.12)",
  innerShadeDeep: "rgba(0, 0, 0, 0.3)",
  shadow: "rgba(0, 0, 0, 0.35)",
};

/** pill: buttons/chips/controls; panel: veils/cards/modals; control: small nested surfaces */
export const radii = {
  pill: "999px",
  panel: "1.5rem",
  control: ".75rem",
};

/** Durations/easing for UI transitions. */
export const motion = {
  fast: "150ms",
  base: "250ms",
  slow: "1200ms",
  ease: "cubic-bezier(0.4, 0, 0.2, 1)",
};

// mock viewport units for mobile corner cases
// see https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
export const vh = (quantity: number) => `calc(var(--vh, 1vh) * ${quantity})`;
export const vw = (quantity: number) => `calc(var(--vw, 1vw) * ${quantity})`;

/**
 * Role-based type ramp — the lightweight design system. The values encode
 * the app's two long-standing families exactly as they were hand-tuned:
 * static rem roles (landing/global; html is 52.5%, so 1rem ≈ 8.4px) and
 * panel* roles sized in vh, which scale with the viewport inside the in-app
 * panels by original design. Pick a role, don't hand-tune sizes.
 */
export const typeRamp = {
  /** song-card meta lines (bpm | key) */
  caption: { fontSize: "1.2rem", fontWeight: 400, letterSpacing: "0.05em" },
  /** compact landing text: subtitle, info button, icon badges */
  bodyCompact: { fontSize: "1.6rem", fontWeight: 300 },
  /** default reading text (global span/p) */
  body: { fontSize: "1.75rem", fontWeight: 300 },
  /** the landing page's single line of lead-in copy, incl. the loading line */
  lede: { fontSize: "2rem", fontWeight: 300 },
  /** song card names */
  cardTitle: { fontSize: "2.25rem", fontWeight: 300 },
  /** display subheads (info page) */
  display: { fontSize: "3rem", fontWeight: 300 },
  /** panel fine print: S/M buttons */
  panelCaption: { fontSize: vh(1.5), fontWeight: 300 },
  /** panel paragraphs */
  panelBody: { fontSize: vh(1.75), fontWeight: 300 },
  /** buttons and emphasized labels */
  panelLabel: { fontSize: vh(1.75), fontWeight: 500 },
  /** primary control labels (time warp / energy) */
  panelHeading: { fontSize: vh(2.2), fontWeight: 500 },
  /** h3 section headings */
  sectionHeading: { fontSize: vh(2.25), fontWeight: 400 },
  /** h2 panel titles */
  panelTitle: { fontSize: vh(3), fontWeight: 400 },
} as const;
