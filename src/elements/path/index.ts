import { RawElement } from "../../types";
import { getElementBoundaries } from "../utils";
import pathToPoints from "./utils/path-to-points";

const parse = (node: Element) => {
  const data = node.getAttribute("d");
  const color = node.getAttribute("fill");
  const parsedResult = {
    data: "",
    color: "",
  };

  if (data) {
    parsedResult.data = data;
  }

  if (color) {
    parsedResult.color = color;
  }

  return parsedResult;
};

export const convert = (node: Element): RawElement[] => {
  const { data } = parse(node);
  const elementsCoordinates = pathToPoints(data);

  console.log("Points:", elementsCoordinates);

  return elementsCoordinates.map((coordinates) => {
    const boundaries = getElementBoundaries(coordinates);

    return {
      type: "draw",
      points: coordinates,
      ...boundaries,
    };
  });
};
