import elementsConverter from "./elements";
import { RawElement, ExcalidrawScene } from "./types";
import { safeNumber } from "./utils";

const SUPPORTED_TAGS = ["svg", "path"];

/**
 * Get a DOM representation of a SVG file content
 * @todo Handle parsing errors
 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
 */
const getDOMFromString = (svgString: string): XMLDocument => {
  const parser = new DOMParser();
  const svgDOM = parser.parseFromString(svgString, "image/svg+xml");

  console.debug("Parsed DOM:", svgDOM);

  return svgDOM;
};

/**
 * Validate a node given by TreeWalker iteration algorithm
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NodeFilter/acceptNode
 */
const nodeValidator = (node: Element): number => {
  if (SUPPORTED_TAGS.includes(node.tagName)) {
    console.debug("Allowing node:", node.tagName);

    return NodeFilter.FILTER_ACCEPT;
  }

  console.debug("Rejecting node:", node.tagName || node.nodeName);

  return NodeFilter.FILTER_REJECT;
};

const getNodeListFromDOM = (dom: XMLDocument): Element[] => {
  const treeWalker = document.createTreeWalker(dom, NodeFilter.SHOW_ALL, {
    acceptNode: nodeValidator,
  });
  const nodeList: Element[] = [];
  let currentNode = true;

  while (currentNode) {
    if (currentNode !== true) {
      nodeList.push(currentNode);
    }

    // @ts-ignore // will update in a bit.
    currentNode = treeWalker.nextNode();
  }

  return nodeList;
};

const calculateElementsPositions = (elements: RawElement[]): RawElement[] => {
  const { x: minX, y: minY } = elements.reduce(
    (minCoordinates, { x, y }) => {
      if (x < minCoordinates.x) minCoordinates.x = x;
      if (y < minCoordinates.y) minCoordinates.y = y;

      return minCoordinates;
    },
    {
      x: Infinity,
      y: Infinity,
    },
  );

  return elements.map((element) => {
    const x = safeNumber(element.x - minX);
    const y = safeNumber(element.y - minY);

    return {
      ...element,
      points: element.points.map(([pX, pY]) => [
        safeNumber(pX - x - minX),
        safeNumber(pY - y - minY),
      ]),
      x,
      y,
    };
  });
};

const handleElements = (nodeList: Element[]): ExcalidrawScene => {
  const elements = [];

  for (const node of nodeList) {
    switch (node.nodeName) {
      case "svg": {
        const viewBox = node.getAttribute("viewBox");

        console.log("Viewbox:", viewBox);

        break;
      }
      case "path": {
        const pathElements = elementsConverter.path.convert(node);

        if (pathElements.length) {
          elements.push(...pathElements);
        }

        break;
      }
    }
  }

  return {
    type: "excalidraw",
    version: 2,
    source: "https://excalidraw.com",
    elements: calculateElementsPositions(elements).map((element) => ({
      angle: 0,
      fillStyle: "hachure",
      opacity: 100,
      roughness: 1,
      seed: Math.floor(
        Math.random() * (100_000_000 - 1_000_000 + 1) + 1_000_000,
      ),
      strokeColor: "#000000",
      strokeSharpness: "sharp",
      strokeWidth: 1,
      backgroundColor: "transparent",
      ...element,
    })),
  };
};

/**
 * Parse a SVG file content
 */
export const parse = (input: string): ExcalidrawScene => {
  const svgDOM = getDOMFromString(input);
  const nodeList = getNodeListFromDOM(svgDOM);

  console.debug("Fetched nodes:", nodeList);

  const elements = handleElements(nodeList);

  return elements;
};
