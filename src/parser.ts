const SUPPORTED_TAGS = ["svg", "path"];

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

/**
 * Parse a SVG file content
 */
export function parse(input: string): Element[] {
  const svgDOM = getDOMFromString(input);

  const nodeList = getNodeListFromDOM(svgDOM);

  console.debug("Fetched nodes:", nodeList);

  return nodeList;
}
