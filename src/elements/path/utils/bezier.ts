import { Coordinates } from "../../../types";
import { safeNumber } from "../../../utils";

/**
 * Get coordinates x,y of a point at a given section of a cubic bezier curve.
 * This function only supports two dimensions curves
 * @see https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Cubic_B%C3%A9zier_curves
 */
const getCoordinateOfCubicCurve = (
  controlCoordinates: Coordinates[],
  section: number,
): Coordinates => Array.from({ length: 2 }).map((v, i) => {
  const coordinates =
    controlCoordinates[0][i] * (1 - section) ** 3 +
    3 * controlCoordinates[1][i] * section * (1 - section) ** 2 +
    3 * controlCoordinates[2][i] * section ** 2 * (1 - section) +
    controlCoordinates[3][i] * section ** 3;

  return safeNumber(coordinates);
});

/**
 * Get coordinates x,y of a point at a given section of a quadratic bezier curve.
 * This function only supports two dimensions curves
 * @see https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Quadratic_B%C3%A9zier_curves
 */
const getCoordinateOfQuadraticCurve = (
  controlCoordinates: Coordinates[],
  section: number,
): Coordinates => Array.from({ length: 2 }).map((v, i) => {
  const coordinates =
    controlCoordinates[0][i] * (1 - section) ** 2 +
    2 * controlCoordinates[1][i] * section * (1 - section) +
    controlCoordinates[2][i] * section ** 2;

  return safeNumber(coordinates);
})

/**
 * Get list of coordinates for a cubic bézier curve.
 * Starting point is not returned
 */
export const curveToPoints = (
  type: "cubic" | "quadratic",
  controlCoordinates: Coordinates[],
  nbCoordinates = 10,
): Coordinates[] => {
  if (nbCoordinates <= 0) {
    throw new Error("nbCoordinates must be positive");
  } else if (nbCoordinates > 100) {
    nbCoordinates = 100;
  }

  return Array.from({ length: nbCoordinates }, (value, index) => {
    const section = safeNumber(((100 / nbCoordinates) * (index + 1)) / 100);

    if (type === "cubic") {
      return getCoordinateOfCubicCurve(controlCoordinates, section);
    } else if (type === "quadratic") {
      return getCoordinateOfQuadraticCurve(controlCoordinates, section)
    }

    throw new Error("Invalid bézier curve type requested")
  });
};
