// Minimal ambient declaration for d3-ease@3 (no bundled types).
// Only the easing factory API used in Analyser.ts is typed here.
declare module "d3-ease" {
  interface PolyEasingFactory {
    (t: number): number;
    exponent(e: number): (t: number) => number;
  }
  export const easePolyIn: PolyEasingFactory;
  export const easePolyOut: PolyEasingFactory;
  export const easePolyInOut: PolyEasingFactory;
}
