import { Coordinates } from '../../../types';
import { safeNumber } from '../../../utils';

/**
 * Get coordinates x,y of a point at a given section of a cubic bezier curve.
 * @see https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Cubic_B%C3%A9zier_curves
 */
const getPointOfCubicCurve = (
  controlPoints: Coordinates[],
  section: number,
): Coordinates => {
  // Support only two dimensions curves
  return Array.from({ length: 2 }).map((v, i) => {
    const pointCoordinate =
      controlPoints[0][i] * (1 - section) ** 3 +
      3 * controlPoints[1][i] * section * (1 - section) ** 2 +
      3 * controlPoints[2][i] * section ** 2 * (1 - section) +
      controlPoints[3][i] * section ** 3;

    return safeNumber(pointCoordinate);
  });
}

/**
 * Get list of coordinates for a cubic bézier curve.
 * Starting point is not returned
 */
export const cubicCurveToPoints = (
  controlPoints: Coordinates[],
  nbPoints = 10,
): Coordinates[] => {
  if (nbPoints <= 0) {
    throw new Error("Precision must be positive");
  } else if (nbPoints > 100) {
    nbPoints = 100;
  }

  return Array.from({ length: nbPoints }, (value, index) => {
    const section = safeNumber(((100 / nbPoints) * (index + 1)) / 100);

    return getPointOfCubicCurve(controlPoints, section);
  });
}
