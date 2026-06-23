// Minimal ambient declaration for d3-color.
declare module "d3-color" {
  interface ColorCommon {
    brighter(k?: number): this;
    darker(k?: number): this;
    displayable(): boolean;
    toString(): string;
    formatHex(): string;
    formatRgb(): string;
    copy(values?: Partial<ColorCommon>): this;
  }
  interface ColorConstructor {
    new (cssColorString: string): ColorCommon;
    (cssColorString: string): ColorCommon;
  }
  const color: ColorConstructor;
  function rgb(r: number, g: number, b: number, opacity?: number): ColorCommon;
  export { color, rgb };
}
