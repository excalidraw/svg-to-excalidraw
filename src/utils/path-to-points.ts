import { cubicCurveToPoints } from "./bezier";

const PATH_COMMANDS_REGEX = /(?:(M(?:-?\d+(?:\.\d+)?(?:,| )?){2})|(m(?:-?\d+(?:\.\d+)?(?:,| )?){2})|(?:(L(?:-?\d+(?:\.\d+)?(?:,| )?){2}))|(l(?:-?\d+(?:\.\d+)?(?:,| )?){2})|(H-?\d+(?:\.\d+)?)|(V-?\d+(?:\.\d+)?)|(h-?\d+(?:\.\d+)?)|(v-?\d+(?:\.\d+)?)|(C(?:-?\d+(?:\.\d+)?(?:\.\d+)?(?:,| )?){6})|(c(?:-?\d+(?:\.\d+)?(?:\.\d+)?(?:,| )?){6})|(z|Z))/g;
const COMMAND_REGEX = /(?:[MmLlHhVvCcZz]|(-?\d+(?:\.\d+)?))/g;

/**
 * Convert a SVG path data to list of coordinates
 */
export default function pathToPoints(path: string): number[][][] {
  const commands = path.match(PATH_COMMANDS_REGEX);
  const elements: number[][][] = [];
  let currentPosition = [0, 0];
  let points: number[][] = [];

  function publishAndResetCurrentPoints() {
    if (points.length) {
      elements.push(points);
    }

    points = [];
  }

  if (commands?.length) {
    for (const command of commands) {
      console.log("Full command:", command);

      const commandMatch = command.match(COMMAND_REGEX);

      if (commandMatch?.length) {
        const commandType = commandMatch[0];
        let coordinates = commandMatch
          .slice(1, commandMatch.length)
          .map((coordinate) => +coordinate);
        const isRelative = commandType.toLowerCase() === commandType;

        console.log("Commande type:", commandType);
        console.log("Coordinates:", coordinates);

        switch (commandType) {
          case "M":
          case "m":
          case "L":
          case "l":
            if (isRelative) {
              coordinates = [
                currentPosition[0] + coordinates[0],
                currentPosition[1] + coordinates[1],
              ];
            }

            points.push(coordinates);

            currentPosition = coordinates;

            break;
          case "H":
          case "h":
            coordinates = [
              currentPosition[0] + coordinates[0],
              currentPosition[1],
            ];

            points.push(coordinates);

            currentPosition = coordinates;

            break;
          case "V":
          case "v":
            coordinates = [
              currentPosition[0],
              currentPosition[1] + coordinates[0],
            ];

            points.push(coordinates);

            currentPosition = coordinates;

            break;
          case "C":
          case "c": {
            const controlPoints = [currentPosition];

            if (isRelative) {
              controlPoints.push(
                [
                  currentPosition[0] + coordinates[0],
                  currentPosition[1] + coordinates[1],
                ],
                [
                  currentPosition[0] + coordinates[2],
                  currentPosition[1] + coordinates[3],
                ],
                [
                  currentPosition[0] + coordinates[4],
                  currentPosition[1] + coordinates[5],
                ],
              );
            } else {
              controlPoints.push(
                [coordinates[0], coordinates[1]],
                [coordinates[2], coordinates[3]],
                [coordinates[4], coordinates[5]],
              );
            }

            const coordinatesList = cubicCurveToPoints(controlPoints);

            points.push(...coordinatesList);

            currentPosition = coordinatesList[coordinatesList.length - 1];

            break;
          }
          case "Z":
          case "z":
            publishAndResetCurrentPoints();

            break;
        }
      } else {
        console.error("Unsupported command provided will be ignored:", command);
      }
    }

    return elements;
  }

  throw new Error("No commands found in given path");
}
