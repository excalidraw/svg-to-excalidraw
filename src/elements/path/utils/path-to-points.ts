import { Coordinates } from "../../../types";
import { safeNumber } from "../../../utils";
import { curveToPoints } from "./bezier";

const PATH_COMMANDS_REGEX = /(?:([MmLl](?:-?\d+(?:\.\d+)?(?:,| )?){2})|([HhVv]-?\d+(?:\.\d+)?)|([Cc](?:-?\d+(?:\.\d+)?(?:\.\d+)?(?:,| )?){6})|([Qq](?:-?\d+(?:\.\d+)?(?:\.\d+)?(?:,| )?){4})|(z|Z))/g;
const COMMAND_REGEX = /(?:[MmLlHhVvCcQqZz]|(-?\d+(?:\.\d+)?))/g;

/**
 * Convert a SVG path data to list of coordinates
 */
const pathToPoints = (path: string): Coordinates[][] => {
  const commands = path.match(PATH_COMMANDS_REGEX);
  const elements = [];
  let currentPosition = [0, 0];
  let coordinates = [];

  if (!commands?.length) {
    throw new Error("No commands found in given path");
  }

  for (const command of commands) {
    console.groupCollapsed(command);

    const commandMatch = command.match(COMMAND_REGEX);

    if (commandMatch?.length) {
      const commandType = commandMatch[0];
      let commandCoordinates = commandMatch
        .slice(1, commandMatch.length)
        .map((coordinate) => safeNumber(Number(coordinate)));
      const isRelative = commandType.toLowerCase() === commandType;

      console.log("Commande type:", commandType);
      console.log("Coordinates:", commandCoordinates);

      switch (commandType) {
        case "M":
        case "m":
        case "L":
        case "l":
          if (isRelative) {
            commandCoordinates = [
              currentPosition[0] + commandCoordinates[0],
              currentPosition[1] + commandCoordinates[1],
            ];
          }

          coordinates.push(commandCoordinates);

          currentPosition = commandCoordinates;

          break;
        case "H":
        case "h": {
          let targetCoordinate = [commandCoordinates[0], currentPosition[1]];

          if (isRelative) {
            targetCoordinate = [
              currentPosition[0] + commandCoordinates[0],
              currentPosition[1],
            ];
          }

          coordinates.push(targetCoordinate);

          currentPosition = targetCoordinate;

          break;
        }
        case "V":
        case "v": {
          let targetCoordinate = [currentPosition[0], commandCoordinates[0]];

          if (isRelative) {
            targetCoordinate = [
              currentPosition[0],
              currentPosition[1] + commandCoordinates[0],
            ];
          }

          coordinates.push(targetCoordinate);

          currentPosition = targetCoordinate;

          break;
        }
        case "C":
        case "c": {
          const controlPoints = [currentPosition];

          if (isRelative) {
            controlPoints.push(
              [
                currentPosition[0] + commandCoordinates[0],
                currentPosition[1] + commandCoordinates[1],
              ],
              [
                currentPosition[0] + commandCoordinates[2],
                currentPosition[1] + commandCoordinates[3],
              ],
              [
                currentPosition[0] + commandCoordinates[4],
                currentPosition[1] + commandCoordinates[5],
              ],
            );
          } else {
            controlPoints.push(
              [commandCoordinates[0], commandCoordinates[1]],
              [commandCoordinates[2], commandCoordinates[3]],
              [commandCoordinates[4], commandCoordinates[5]],
            );
          }

          console.log("Control points:", controlPoints);

          const coordinatesList = curveToPoints("cubic", controlPoints);

          console.log("Curve coordinates:", coordinatesList);

          coordinates.push(...coordinatesList);

          currentPosition = coordinatesList[coordinatesList.length - 1];

          break;
        }
        case "Q":
        case "q": {
          const controlPoints = [currentPosition];

          if (isRelative) {
            controlPoints.push(
              [
                currentPosition[0] + commandCoordinates[0],
                currentPosition[1] + commandCoordinates[1],
              ],
              [
                currentPosition[0] + commandCoordinates[2],
                currentPosition[1] + commandCoordinates[3],
              ],
            );
          } else {
            controlPoints.push(
              [commandCoordinates[0], commandCoordinates[1]],
              [commandCoordinates[2], commandCoordinates[3]],
            );
          }

          console.log("Control points:", controlPoints);

          const coordinatesList = curveToPoints("quadratic", controlPoints);

          console.log("Curve coordinates:", coordinatesList);

          coordinates.push(...coordinatesList);

          currentPosition = coordinatesList[coordinatesList.length - 1];

          break;
        }
        case "Z":
        case "z":
          if (coordinates.length) {
            const lastCoordinates = coordinates[coordinates.length - 1];

            if (
              lastCoordinates[0] !== coordinates[0][0] ||
              lastCoordinates[1] !== coordinates[0][1]
            ) {
              coordinates.push(coordinates[0]);
            }

            elements.push(coordinates);
          }

          coordinates = [];

          break;
      }
    } else {
      console.error("Unsupported command provided will be ignored:", command);
    }

    console.log("Current position:", currentPosition);
    console.log("Last point:", coordinates[coordinates.length - 1]);
    console.groupEnd();
  }

  if (elements.length === 0 && coordinates.length) {
    elements.push(coordinates);
  }

  return elements;
};

export default pathToPoints;
