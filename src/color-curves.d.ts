// Minimal ambient declaration for color-curves.
declare module "color-curves" {
  class ColorPalette {
    constructor(hCurve: string, lCurve: string, range: string);
    rgbValueAt(t: number): string;
  }
  export { ColorPalette };
}
