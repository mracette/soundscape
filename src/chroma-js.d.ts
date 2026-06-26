// Minimal ambient declaration for chroma-js (no bundled types).
declare module "chroma-js" {
  interface Color {
    gl(): [number, number, number, number];
    hex(): string;
  }
  interface Scale {
    (t: number): Color;
    mode(mode: string): Scale;
    colors(n: number, format: string): string[];
  }
  interface ChromaStatic {
    scale(colors: string[]): Scale;
    mix(color1: Color, color2: Color, ratio: number, mode?: string): Color;
    new (color: string): Color;
    (color: string): Color;
  }
  const chroma: ChromaStatic;
  export = chroma;
}
