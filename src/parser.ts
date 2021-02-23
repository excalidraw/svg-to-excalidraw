import elements from './elements';
import { ExcalidrawElement } from './types';
import { safeNumber } from './utils';

const SUPPORTED_TAGS = ['svg', 'path'];

/**
 * Get a DOM representation of a SVG file content
 * @todo Handle parsing errors
 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
 */
function getDOMFromString(svgString: string): XMLDocument {
  const parser = new DOMParser();
  const svgDOM = parser.parseFromString(svgString, "image/svg+xml");

  console.debug("Parsed DOM:", svgDOM);

  return svgDOM;
}

/**
 * Validate a node given by TreeWalker iteration algorithm
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NodeFilter/acceptNode
 */
function nodeValidator(el: Element): number {
  if (SUPPORTED_TAGS.includes(el.tagName)) {
    console.debug("Allowing node:", el.tagName);

    return NodeFilter.FILTER_ACCEPT;
  }

  console.debug("Rejecting node:", el.tagName || el.nodeName);

  return NodeFilter.FILTER_REJECT;
}

function getNodeListFromDOM(dom: XMLDocument): Element[] {
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
}

function calculateElementsPositions(excalidrawElements: ExcalidrawElement[]): ExcalidrawElement[] {
  const { x: minX, y: minY } = excalidrawElements.reduce((minCoordinates, { x, y }) => {
    if (x < minCoordinates.x) minCoordinates.x = x;
    if (y < minCoordinates.y) minCoordinates.y = y;

    return minCoordinates;
  }, {
    x: Infinity,
    y: Infinity,
  });

  return excalidrawElements.map((element) => ({
    ...element,
    points: element.points.map(([x, y]) => [
      safeNumber(x - minX),
      safeNumber(y - minY),
    ]),
    x: safeNumber(element.x - minX),
    y: safeNumber(element.y - minY),
  }));
}

function handleElements(nodeList: Element[]): ExcalidrawElement[] {
  const excalidrawElements = [];

  for (const node of nodeList) {
    switch (node.nodeName) {
      case 'svg': {
        const viewBox = node.getAttribute('viewBox');

        console.log('Viewbox:', viewBox);

        break;
      }
      case 'path': {
        const pathElements = elements.path.convert(node);

        if (pathElements.length) {
          excalidrawElements.push(...pathElements);
        }

        break;
      }
    }
  }

  return calculateElementsPositions(excalidrawElements);
}

/**
 * Parse a SVG file content
 */
export function parse(input: string): ExcalidrawElement[] {
  const svgDOM = getDOMFromString(input);
  const nodeList = getNodeListFromDOM(svgDOM);

  console.debug("Fetched nodes:", nodeList);

  const elements = handleElements(nodeList);

  return elements;
}
