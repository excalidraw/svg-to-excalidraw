import { PathCommand } from "../../../types";
import { safeNumber } from "../../../utils";
import { curveToPoints } from "./bezier";

const PATH_COMMANDS_REGEX = /(?:([HhVv] *-?\d+(?:\.\d+)?)|([MmLlTt](?: *-?\d+(?:\.\d+)?(?:,| *)?){2})|([Cc](?: *-?\d+(?:\.\d+)?(?:\.\d+)?(?:,| *)?){6})|([QqSs](?: *-?\d+(?:\.\d+)?(?:\.\d+)?(?:,| *)?){4})|(z|Z))/g;
const COMMAND_REGEX = /(?:[MmLlHhVvCcSsQqTtZz]|(-?\d+(?:\.\d+)?))/g;

const handleMoveToAndLineTo = (
  currentPosition: number[],
  parameters: number[],
  isRelative: boolean,
): number[] => {
  if (isRelative) {
    return [
      currentPosition[0] + parameters[0],
      currentPosition[1] + parameters[1],
    ];
  }

  return parameters;
};

const handleHorizontalLineTo = (
  currentPosition: number[],
  x: number,
  isRelative: boolean,
): number[] => {
  if (isRelative) {
    return [currentPosition[0] + x, currentPosition[1]];
  }

  return [x, currentPosition[1]];
};

const handleVerticalLineTo = (
  currentPosition: number[],
  y: number,
  isRelative: boolean,
): number[] => {
  if (isRelative) {
    return [currentPosition[0], currentPosition[1] + y];
  }

  return [currentPosition[0], y];
};

const handleCubicCurveTo = (
  currentPosition: number[],
  parameters: number[],
  lastCommand: PathCommand,
  isSimpleForm: boolean,
  isRelative: boolean,
): number[][] => {
  const controlPoints = [currentPosition];
  let inferredControlPoint;

  if (isSimpleForm) {
    console.log("Last command:", lastCommand);

    inferredControlPoint = ["C", "c"].includes(lastCommand?.type)
      ? [
        currentPosition[0] - (lastCommand.parameters[2] - currentPosition[0]),
        currentPosition[1] - (lastCommand.parameters[3] - currentPosition[1]),
      ]
      : currentPosition;
  }

  if (isRelative) {
    controlPoints.push(
      inferredControlPoint || [
        currentPosition[0] + parameters[0],
        currentPosition[1] + parameters[1],
      ],
      [currentPosition[0] + parameters[2], currentPosition[1] + parameters[3]],
      [currentPosition[0] + parameters[4], currentPosition[1] + parameters[5]],
    );
  } else {
    controlPoints.push(
      inferredControlPoint || [parameters[0], parameters[1]],
      [parameters[2], parameters[3]],
      [parameters[4], parameters[5]],
    );
  }

  console.log("Control points:", controlPoints);

  return curveToPoints("cubic", controlPoints);
};

const handleQuadraticCurveTo = (
  currentPosition: number[],
  parameters: number[],
  lastCommand: PathCommand,
  isSimpleForm: boolean,
  isRelative: boolean,
): number[][] => {
  const controlPoints = [currentPosition];
  let inferredControlPoint;

  if (isSimpleForm) {
    console.log("Last command:", lastCommand);

    inferredControlPoint = ["Q", "q"].includes(lastCommand?.type)
      ? [
        currentPosition[0] - (lastCommand.parameters[0] - currentPosition[0]),
        currentPosition[1] - (lastCommand.parameters[1] - currentPosition[1]),
      ]
      : currentPosition;
  }

  if (isRelative) {
    controlPoints.push(
      inferredControlPoint || [
        currentPosition[0] + parameters[0],
        currentPosition[1] + parameters[1],
      ],
      [currentPosition[0] + parameters[2], currentPosition[1] + parameters[3]],
    );
  } else {
    controlPoints.push(inferredControlPoint || [parameters[0], parameters[1]], [
      parameters[2],
      parameters[3],
    ]);
  }

  console.log("Control points:", controlPoints);

  return curveToPoints("quadratic", controlPoints);
};

/**
 * Convert a SVG path data to list of coordinates
 */
const pathToPoints = (path: string): number[][][] => {
  const commands = path.match(PATH_COMMANDS_REGEX);
  const elements = [];
  const commandsHistory = [];
  let currentPosition = [0, 0];
  let points = [];

  if (!commands?.length) {
    throw new Error("No commands found in given path");
  }

  console.log("Commands:", commands);

  for (const command of commands) {
    console.groupCollapsed(command);

    const lastCommand = commandsHistory[commandsHistory.length - 2];
    const commandMatch = command.match(COMMAND_REGEX);

    currentPosition = points[points.length - 1] || currentPosition;

    console.log("Current position:", currentPosition);

    if (commandMatch?.length) {
      const commandType = commandMatch[0];
      const parameters = commandMatch
        .slice(1, commandMatch.length)
        .map((coordinate) => safeNumber(Number(coordinate)));
      const isRelative = commandType.toLowerCase() === commandType;

      commandsHistory.push({
        type: commandType,
        parameters,
        isRelative,
      });

      console.log("Command type:", commandType);
      console.log("Parameters:", parameters);

      switch (commandType) {
        case "M":
        case "m":
        case "L":
        case "l":
          points.push(
            handleMoveToAndLineTo(currentPosition, parameters, isRelative),
          );

          break;
        case "H":
        case "h":
          points.push(
            handleHorizontalLineTo(currentPosition, parameters[0], isRelative),
          );

          break;
        case "V":
        case "v":
          points.push(
            handleVerticalLineTo(currentPosition, parameters[0], isRelative),
          );

          break;
        case "C":
        case "c":
        case "S":
        case "s":
          points.push(
            ...handleCubicCurveTo(
              currentPosition,
              parameters,
              lastCommand,
              ["S", "s"].includes(commandType),
              isRelative,
            ),
          );

          break;
        case "Q":
        case "q":
        case "T":
        case "t":
          points.push(
            ...handleQuadraticCurveTo(
              currentPosition,
              parameters,
              lastCommand,
              ["T", "t"].includes(commandType),
              isRelative,
            ),
          );

          break;
        case "Z":
        case "z":
          if (points.length) {
            if (
              currentPosition[0] !== points[0][0] ||
              currentPosition[1] !== points[0][1]
            ) {
              points.push(points[0]);
            }

            elements.push(points);
          }

          points = [];

          break;
      }
    } else {
      console.error("Unsupported command provided will be ignored:", command);
    }

    console.groupEnd();
  }

  if (elements.length === 0 && points.length) {
    elements.push(points);
  }

  return elements;
};

export default pathToPoints;
