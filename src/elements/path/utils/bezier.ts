import { Coordinates } from "../../../types";
import { safeNumber } from "../../../utils";

/**
 * Get coordinates x,y of a point at a given section of a cubic bezier curve.
 * @see https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Cubic_B%C3%A9zier_curves
 */
const getCoordinateOfCubicCurve = (
  controlCoordinates: Coordinates[],
  section: number,
): Coordinates => {
  // Support only two dimensions curves
  return Array.from({ length: 2 }).map((v, i) => {
    const coordinates =
      controlCoordinates[0][i] * (1 - section) ** 3 +
      3 * controlCoordinates[1][i] * section * (1 - section) ** 2 +
      3 * controlCoordinates[2][i] * section ** 2 * (1 - section) +
      controlCoordinates[3][i] * section ** 3;

    return safeNumber(coordinates);
  });
}

/**
 * Get list of coordinates for a cubic bézier curve.
 * Starting point is not returned
 */
export const cubicCurveToPoints = (
  controlCoordinates: Coordinates[],
  nbCoordinates = 10,
): Coordinates[] => {
  if (nbCoordinates <= 0) {
    throw new Error("Precision must be positive");
  } else if (nbCoordinates > 100) {
    nbCoordinates = 100;
  }

  return Array.from({ length: nbCoordinates }, (value, index) => {
    const section = safeNumber(((100 / nbCoordinates) * (index + 1)) / 100);

    return getCoordinateOfCubicCurve(controlCoordinates, section);
  });
}
