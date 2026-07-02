export const fontColor = "#ffffff";
export const lightGrey = "#d8d8d8";
export const offBlack = "#1f262f";
export const offBlack2 = "#141b24";
export const menuContentColor = "rgba(255,255,255,0.2)";
export const moonYellow = "#f6f2d5";
export const hotPink = "rgb(255, 76, 122)";
export const hotGreen = "rgb(0, 225, 158)";
export const hotBlue = "rgb(0, 249, 255)";

// Glow companions to the accent quartet above — same hue, used for
// box-shadow/text-shadow/drop-shadow glow. Base hex/rgb values above are
// unchanged so existing consumers (THREE.js scenes, landing page) render
// identically to today.
export const hotPinkGlow = "rgba(255, 76, 122, 0.6)";
export const hotGreenGlow = "rgba(0, 225, 158, 0.55)";
export const hotBlueGlow = "rgba(0, 249, 255, 0.55)";
export const moonYellowGlow = "rgba(246, 242, 213, 0.5)";

// Fake-glass panel texture: a subtle SVG noise overlay instead of a real
// backdrop-filter blur (blur over the WebGL canvas is expensive, especially
// on mobile, and would render inconsistently per platform). Finer grain and
// lower baked-in opacity than a first pass, meant to be composited with
// `background-blend-mode: overlay` so it reads as frosted grain rather than
// flat static.
export const glassNoiseTexture =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E\")";

export const panelRadius = "1.5rem";

export const easeOrganic = "cubic-bezier(0.45, 0, 0.2, 1)";

export const sSize = "0.8rem";
export const mSize = "1.6rem";
export const lSize = "3.2rem";
export const xlSize = "4.8rem";
export const xxlSize = "10.5rem";

// mock viewport units for mobile corner cases
// see https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
export const vh = (quantity: number) => `calc(var(--vh, 1vh) * ${quantity})`;
export const vw = (quantity: number) => `calc(var(--vw, 1vw) * ${quantity})`;
