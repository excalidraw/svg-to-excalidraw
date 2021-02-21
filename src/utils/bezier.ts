function getPointAt(controlPoints, step) {
  return Array.from({ length: 2 }).map(
    (v, i) =>
      +(
        controlPoints[0][i] * (1 - step) ** 3 +
        3 * controlPoints[1][i] * step * (1 - step) ** 2 +
        3 * controlPoints[2][i] * step ** 2 * (1 - step) +
        controlPoints[3][i] * step ** 3
      ).toFixed(2),
  );
}

export function cubic(controlPoints, precision = 20) {
  if (precision === 100 || 100 % precision) {
    throw new Error("Precision must be one of 1, 2, 4, 5, 10, 20, 25, 50");
  }

  return Array.from({ length: 100 / precision - 1 }).map((value, index) =>
    getPointAt(controlPoints, ((index + 1) * precision) / 100),
  );
}
