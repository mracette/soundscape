const regularPolygon = (
  nSides: number,
  size = 1,
  cx = 0,
  cy = 0,
  closedLoop = true,
  rotate = false,
  twoDim = false
): Float32Array => {
  const nPoints = closedLoop ? nSides + 1 : nSides;
  const nCoords = twoDim ? 2 : 3;
  const points = new Float32Array(nPoints * nCoords);
  for (let i = 0; i < nPoints; i++) {
    if (twoDim) {
      points[i * nCoords] = cx + size * Math.cos((i * 2 * Math.PI) / nSides);
      points[i * nCoords + 1] =
        cy + size * Math.sin((i * 2 * Math.PI) / nSides);
    } else {
      points[i * nCoords] = cx + size * Math.cos((i * 2 * Math.PI) / nSides);
      points[i * nCoords + 1] = rotate
        ? 0
        : cy + size * Math.sin((i * 2 * Math.PI) / nSides);
      points[i * nCoords + 2] = rotate
        ? cy + size * Math.sin((i * 2 * Math.PI) / nSides)
        : 0;
    }
  }
  return points;
};

const solveExpEquation = (
  x0: number,
  y0: number,
  x1: number,
  y1: number
): { a: number; b: number } => {
  // solve the system of equations ...
  // a*b^(x0) = y0
  // a*b^(x1) = y1

  const b = Math.pow(y1 / y0, 1 / (x1 - x0));
  const a = y0 / Math.pow(b, x0);
  return { a, b }; // to be used y = ab^x
};

const linToLog = (w: number): { a: number; b: number } => {
  /*
   *
   * linear scale: [1, w]
   *    log scale: [1, w]
   *
   * (x0, y0): (1, 1)
   * (x1, y1): (w, w)
   *
   * b = log(y0/y1)/(x0-x1)
   * b = log(1/w)/(1-w)
   *
   * a = y1/exp(b*x1)
   * a = w/exp(b*w)
   *
   */
  const b = Math.log(1 / w) / (1 - w);
  const a = w / Math.exp(b * w);

  return { a, b };
};

const TAU = Math.PI * 2;

const boundedSin = (
  period = 1,
  yMin = -1,
  yMax = 1,
  translateX = 0,
  translateY = 0,
  invert = false
): ((x: number) => number) => {
  return (x: number) =>
    yMin +
    (yMax - yMin) *
      (0.5 +
        ((invert ? -1 : 1) * Math.sin(-translateX + (Math.PI * x) / (period / 2))) / 2) +
    translateY;
};

const clamp = (n: number, min: number, max: number): number => {
  return Math.max(Math.min(max, n), min);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalize = (n: number, min: number, max: number, clamp: any = false): number => {
  return clamp ? (n - min) / (max - min) : (clamp(n, min, max) - min) / (max - min);
};

const lerp = (n0: number, n1: number, t: number): number => {
  return n0 * (1 - t) + n1 * t;
};

const gaussianRand = (factor = 6): number => {
  let rand = 0;
  for (let i = 0; i < factor; i += 1) {
    rand += Math.random();
  }
  return rand / factor;
};

const rotatePoint = (
  px: number,
  py: number,
  cx: number,
  cy: number,
  angle: number
): { x: number; y: number } => {
  return {
    x: Math.cos(angle) * (px - cx) - Math.sin(angle) * (py - cy) + cx,
    y: Math.sin(angle) * (px - cx) + Math.cos(angle) * (py - cy) + cy,
  };
};

interface CanvasCoordinatesOptions {
  nxRange?: [number, number];
  nyRange?: [number, number];
  padding?: number;
  paddingX?: number;
  paddingY?: number;
  xOffset?: number;
  yOffset?: number;
  canvas?: HTMLCanvasElement | null;
  clamp?: boolean;
  baseHeight?: number | null;
  baseWidth?: number | null;
  orientationY?: "up" | "down";
}

interface NxOptions {
  padding?: number;
}

interface NyOptions {
  padding?: number;
  paddingY?: number;
}

class CanvasCoordinates {
  nxRange!: [number, number];
  nyRange!: [number, number];
  padding!: number;
  paddingX!: number;
  paddingY!: number;
  xOffset!: number;
  yOffset!: number;
  canvas!: HTMLCanvasElement | null;
  clamp!: boolean;
  baseHeight!: number | null;
  baseWidth!: number | null;
  orientationY!: "up" | "down";
  width!: number;
  height!: number;

  constructor(options: CanvasCoordinatesOptions = {}) {
    if (
      (typeof options.baseHeight === "undefined" &&
        typeof options.canvas === "undefined") ||
      (typeof options.baseWidth === "undefined" &&
        typeof options.canvas === "undefined")
    ) {
      throw new Error(
        "Invalid options. A canvas element must be supplied if baseHeight or baseWidth are not defined."
      );
    }

    const defaults: Required<CanvasCoordinatesOptions> = {
      nxRange: [-1, 1],
      nyRange: [-1, 1],
      padding: 0,
      paddingX: 0,
      paddingY: 0,
      xOffset: 0,
      yOffset: 0,
      canvas: null,
      clamp: false,
      baseHeight: null,
      baseWidth: null,
      orientationY: "down",
    };
    Object.assign(this, { ...defaults, ...options });
    this.width = this.baseWidth || this.canvas!.width;
    this.height = this.baseHeight || this.canvas!.height;
  }

  nx(n: number, options: NxOptions = {}): number {
    let padding: number;
    this.clamp && (n = clamp(n, this.nxRange[0], this.nxRange[1]));
    if (typeof options.padding === "number") {
      padding = options.padding * this.width;
    } else {
      padding = (this.paddingX || this.padding) * this.width;
    }
    return (
      padding +
      this.xOffset +
      ((n - this.nxRange[0]) / (this.nxRange[1] - this.nxRange[0])) *
        (this.width - 2 * padding)
    );
  }

  xn(x: number, options: NxOptions = {}): number {
    let padding: number;
    if (typeof options.padding === "number") {
      padding = options.padding * this.width;
    } else {
      padding = (this.paddingX || this.padding) * this.width;
    }
    return (x - padding - this.xOffset) / (this.width - padding * 2);
  }

  ny(n: number, options: NyOptions = {}): number | undefined {
    let padding: number;
    this.clamp && (n = clamp(n, this.nyRange[0], this.nyRange[1]));
    if (typeof options.paddingY === "number") {
      padding = options.paddingY * this.height;
    } else if (typeof options.padding === "number") {
      padding = options.padding * this.width;
    } else {
      padding =
        typeof this.paddingY === "number"
          ? this.paddingY * this.height
          : this.padding * this.width;
    }
    if (this.orientationY === "down") {
      return (
        padding +
        this.yOffset +
        ((n - this.nyRange[0]) / (this.nyRange[1] - this.nyRange[0])) *
          (this.height - 2 * padding)
      );
    } else if (this.orientationY === "up") {
      return (
        this.height -
        padding -
        this.yOffset -
        ((n - this.nyRange[0]) / (this.nyRange[1] - this.nyRange[0])) *
          (this.height - 2 * padding)
      );
    }
  }

  yn(y: number, options: NyOptions = {}): number | undefined {
    let padding: number;
    if (typeof options.paddingY === "number") {
      padding = options.paddingY * this.height;
    } else if (typeof options.padding === "number") {
      padding = options.padding * this.width;
    } else {
      padding =
        typeof this.paddingY === "number"
          ? this.paddingY * this.height
          : this.padding * this.width;
    }
    if (this.orientationY === "down") {
      return (y - padding - this.yOffset) / (this.height - padding * 2);
    } else if (this.orientationY === "up") {
      return (this.height - y - padding - this.yOffset) / (this.height - padding * 2);
    }
  }

  getWidth(): number {
    return this.nx(this.nxRange[1]) - this.nx(this.nxRange[0]);
  }

  getHeight(): number | undefined {
    if (this.orientationY === "down") {
      return this.ny(this.nyRange[1])! - this.ny(this.nyRange[0])!;
    } else if (this.orientationY === "up") {
      return this.ny(this.nyRange[0])! - this.ny(this.nyRange[1])!;
    } else {
      return undefined;
    }
  }
}

export {
  regularPolygon,
  linToLog,
  solveExpEquation,
  TAU,
  boundedSin,
  clamp,
  normalize,
  lerp,
  gaussianRand,
  rotatePoint,
  CanvasCoordinates,
};
