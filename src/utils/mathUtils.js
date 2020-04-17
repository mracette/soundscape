const regularPolygon = (
  nSides,
  size = 1,
  cx = 0,
  cy = 0,
  closedLoop = true,
  rotate = false,
  twoDim = false
) => {
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

const solveExpEquation = (x0, y0, x1, y1) => {
  // solve the system of equations ...
  // a*b^(x0) = y0
  // a*b^(x1) = y1

  const b = Math.pow(y1 / y0, 1 / (x1 - x0));
  const a = y0 / Math.pow(b, x0);
  return { a, b }; // to be used y = ab^x
};

const linToLog = (w) => {
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
  let b = Math.log(1 / w) / (1 - w);
  let a = w / Math.exp(b * w);

  return { a, b };
};

export { regularPolygon, linToLog, solveExpEquation };
