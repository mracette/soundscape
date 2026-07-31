import { heroGradientStops } from "../../styles/settings";

// The hero wordmark's CSS gradient runs at 30deg (clockwise from north).
const HERO_ANGLE = (30 * Math.PI) / 180;
const DX = Math.sin(HERO_ANGLE);
const DY = -Math.cos(HERO_ANGLE);

const STOP_RGB = heroGradientStops.map((hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
]);

/** Lerp a channel from white (strength 0) to the stop color (strength 1). */
const toward = (channel: number, strength: number) =>
  Math.round(255 + (channel - 255) * strength);

/**
 * A canvas gradient matching the hero wordmark, running from (x0, y0) to
 * (x1, y1) — e.g. along a single drawn element so each element gets the full
 * sweep. `strength` fades the stops in from white (0 = all white, 1 = full
 * gradient), letting hover transitions blend rather than snap.
 */
export function heroGradientLine(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  strength = 1
): CanvasGradient {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  STOP_RGB.forEach(([r, g, b], i) =>
    gradient.addColorStop(
      i / (STOP_RGB.length - 1),
      `rgb(${toward(r, strength)}, ${toward(g, strength)}, ${toward(b, strength)})`
    )
  );
  return gradient;
}

/**
 * The hero gradient at the wordmark's 30° angle, spanning radius `r` around
 * an element centered at (cx, cy).
 */
export function heroGradientAt(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  strength = 1
): CanvasGradient {
  return heroGradientLine(
    ctx,
    cx - DX * r,
    cy - DY * r,
    cx + DX * r,
    cy + DY * r,
    strength
  );
}
