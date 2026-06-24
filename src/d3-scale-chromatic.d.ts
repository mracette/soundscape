// Minimal ambient declaration for d3-scale-chromatic (no @types package available).
// Only the interpolators used in Moonrise.ts are declared here.
declare module "d3-scale-chromatic" {
  export function interpolateCool(t: number): string;
  export function interpolateViridis(t: number): string;
}
