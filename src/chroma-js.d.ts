// Minimal ambient declaration for chroma-js (no bundled types).
declare module "chroma-js" {
  interface Color {
    gl(): [number, number, number, number];
  }
  interface Scale {
    (t: number): Color;
    mode(mode: string): Scale;
    colors(n: number, format: string): string[];
  }
  interface ChromaStatic {
    scale(colors: string[]): Scale;
  }
  const chroma: ChromaStatic;
  export = chroma;
}
