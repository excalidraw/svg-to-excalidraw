const SUPPORTED_TAGS = ["svg", "path"];

/**
 * Get a DOM representation of a SVG file
 * @param {String} string SVG content to parse
 * @returns {XMLDocument}
 * @todo Handle parsing errors
 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
 */
function getDOMFromString(string) {
  const parser = new DOMParser();
  const svgDOM = parser.parseFromString(string, "image/svg+xml");

  console.debug("Parsed DOM:", svgDOM);

  return svgDOM;
}

/**
 * Validate a node given by TreeWalker iteration algorithm
 * @param {Node} node Node to check
 * @returns {unsigned short}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NodeFilter/acceptNode
 */
function nodeValidator(node) {
  if (SUPPORTED_TAGS.includes(node.tagName)) {
    console.debug("Allowing node:", node.tagName);

    return NodeFilter.FILTER_ACCEPT;
  }

  console.debug("Rejecting node:", node.tagName || node.nodeName);

  return NodeFilter.FILTER_REJECT;
}

/**
 * Get node list from a DOM
 * @param {XMLDocument} dom DOM representation
 * @returns {NodeList}
 */
function getNodeListFromDOM(dom) {
  const treeWalker = document.createTreeWalker(dom, NodeFilter.SHOW_ALL, {
    acceptNode: nodeValidator,
  });
  const nodeList = [];
  let currentNode = true;

  while (currentNode) {
    if (currentNode !== true) {
      nodeList.push(currentNode);
    }

    currentNode = treeWalker.nextNode();
  }

  return nodeList;
}

/**
 * Parse a SVG file content
 * @param {String} input SVG content to parse
 * @returns {NodeList}
 */
function parse(input) {
  const svgDOM = getDOMFromString(input);
  const nodeList = getNodeListFromDOM(svgDOM);

  console.debug("Fetched nodes:", nodeList);

  return nodeList;
}

window.svgParse = parse;
