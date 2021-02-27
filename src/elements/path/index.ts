import { RawElement } from "../../types";
import { getElementBoundaries } from "../utils";
import pathToPoints from "./utils/path-to-points";

const parse = (node: Element) => {
  const data = node.getAttribute("d");
  const backgroundColor = node.getAttribute("fill");
  const strokeColor = node.getAttribute("stroke");
  
  return {
    data: data || "",
    backgroundColor: (backgroundColor !== "currentColor" && backgroundColor) || "transparent",
    strokeColor: (strokeColor !== "currentColor" && strokeColor) || "#000000",
  };
};

export const convert = (node: Element): RawElement[] => {
  const { data, backgroundColor, strokeColor } = parse(node);
  const elementsCoordinates = pathToPoints(data);

  console.log("Points:", elementsCoordinates);

  return elementsCoordinates.map((coordinates) => {
    const boundaries = getElementBoundaries(coordinates);

    return {
      type: "draw",
      points: coordinates,
      backgroundColor,
      strokeColor,
      ...boundaries,
    };
  });
};
