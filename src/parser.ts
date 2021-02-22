const SUPPORTED_TAGS = ["svg", "path"];

/**
 * Get a DOM representation of a SVG file
 * @param {String} svgString SVG content to parse
 * @returns {XMLDocument}
 * @todo Handle parsing errors
 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
 */
export function getDOMFromString(svgString: string): XMLDocument {
  const parser = new DOMParser();
  const svgDOM = parser.parseFromString(svgString, "image/svg+xml");

  console.debug("Parsed DOM:", svgDOM);

  return svgDOM;
}

/**
 * Validate a node given by TreeWalker iteration algorithm
 * @param {Element} el Node to check
 * @returns {number} bit mask (unsigned short)
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NodeFilter/acceptNode
 */
export function nodeValidator(el: Element): number {
  if (SUPPORTED_TAGS.includes(el.tagName)) {
    console.debug("Allowing node:", el.tagName);

    return NodeFilter.FILTER_ACCEPT;
  }

  console.debug("Rejecting node:", el.tagName || el.nodeName);

  return NodeFilter.FILTER_REJECT;
}

/**
 * Get node list from a DOM
 * @param {XMLDocument} dom DOM representation
 * @returns {NodeList}
 */
export function getNodeListFromDOM(dom: XMLDocument): Element[] {
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
 * @param {String} input SVG content to parse
 * @returns {NodeList}
 */
export function parse(input: string): Element[] {
  const svgDOM = getDOMFromString(input);
  const nodeList = getNodeListFromDOM(svgDOM);

  console.debug("Fetched nodes:", nodeList);

  return nodeList;
}
