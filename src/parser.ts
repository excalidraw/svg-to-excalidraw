import elementsConverter from "./elements";
import { RawElement } from "./types";
import { safeNumber } from "./utils";
import ExcalidrawScene from "./elements/ExcalidrawScene";
import ExcalidrawEllipse from "./elements/ExcalidrawEllipse";
import ExcalidrawPath from "./elements/ExcalidrawPath";
import ExcalidrawLine from './elements/ExcalidrawLine';
import Group, { getGroupAttrs } from "./elements/Group";
import ExcalidrawRectangle from "./elements/ExcalidrawRectangle";

const SUPPORTED_TAGS = ["svg", "path", "g", "circle", 'ellipse', 'rect', 'polyline'];

const calculateElementsPositions = (elements: RawElement[]): RawElement[] => {
  const { x: minX, y: minY } = elements.reduce(
    (minPoint, { x, y }) => {
      if (x < minPoint.x) minPoint.x = x;
      if (y < minPoint.y) minPoint.y = y;

      return minPoint;
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

const nodeValidator = (node: Element): number => {
  if (SUPPORTED_TAGS.includes(node.tagName)) {
    console.debug("Allowing node:", node.tagName);

    return NodeFilter.FILTER_ACCEPT;
  }

  console.debug("Rejecting node:", node.tagName || node.nodeName);

  return NodeFilter.FILTER_REJECT;
};

function createTreeWalker(dom: Node): TreeWalker {
  return document.createTreeWalker(dom, NodeFilter.SHOW_ALL, {
    acceptNode: nodeValidator,
  });
}

type WalkerArgs = {
  tw: TreeWalker;
  scene: ExcalidrawScene;
  groups: Group[];
};

function attrOr<D>(el: Element, attr: string, backup: D): D {
  return el.hasAttribute(attr) ? el.getAttribute(attr) as unknown as D : backup;
}


// Need to support as manya of these as possible...
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation
function getPresentationAttrs(el: Element): any {
  /*
  stroke: stroke, stroke-opacity (via RRGGBBAA), stroke-width
  fill: fill, fill-opacity (via RRGGBBAA)
  */
} 

function walkEllipse(args: WalkerArgs): void {
  const { tw, scene, groups } = args;
  const el = tw.currentNode as Element;
  const diameter = Number(el.getAttribute("r")) * 2;

  const groupAttrs = getGroupAttrs(groups);

  const ellipse = new ExcalidrawEllipse({
    x: Number(el.getAttribute("cx")),
    y: Number(el.getAttribute("cy")),
    width: diameter,
    height: diameter,
    groupIds: groups.map((g) => g.id),
    ...groupAttrs,
  });

  scene.elements.push(ellipse);

  walk(args, tw.nextNode());
}

const walkers = {
  svg: (args: WalkerArgs) => {
    walk(args, args.tw.nextNode());
  },

  g: (args: WalkerArgs) => {
    const nextArgs = {
      ...args,
      tw: createTreeWalker(args.tw.currentNode),
      groups: [...args.groups, new Group(args.tw.currentNode as Element)],
    };

    walk(nextArgs, nextArgs.tw.nextNode());

    walk(args, args.tw.nextSibling());
  },

  circle: walkEllipse,

  ellipse: walkEllipse,

  line: (args: WalkerArgs) => {
    // unimplemented
    walk(args, args.tw.nextNode());
  },

  polygon: (args: WalkerArgs) => {
    // unimplemented
    walk(args, args.tw.nextNode());
  },

  // TODO: Finish implementing this.
  polyline: (args: WalkerArgs) => {
    const { tw, scene, groups } = args;
    const el = tw.currentNode as Element;

    // parse points...
    const groupAttrs = getGroupAttrs(groups);

    const line = new ExcalidrawLine({
      ...getGroupAttrs,
    });

    // unimplemented
    walk(args, args.tw.nextNode());
  },

  rect: (args: WalkerArgs) => {
    const { tw, scene, groups } = args;
    const el = tw.currentNode as Element;

    /*
    NOTE: Currently there doesn't seem to be a way to specify the border
          radius of a rect within Excalidraw. This means that attributes
          rx and ry can't be used.
    */
    const isRound = el.hasAttribute('rx') || el.hasAttribute('ry');

    const groupAttrs = getGroupAttrs(groups);
    const rect = new ExcalidrawRectangle({
      x: Number(attrOr<number>(el, 'x', 0)),
      y: Number(attrOr<number>(el, 'y', 0)),
      width: Number(attrOr<number>(el, 'width', 0)),
      height: Number(attrOr<number>(el, 'height', 0)),
      strokeSharpness: isRound ? 'round' : 'sharp',
      ...groupAttrs,
    });

    scene.elements.push(rect);

    walk(args, args.tw.nextNode());
  },

  path: (args: WalkerArgs) => {
    const { tw, scene } = args;
    const pathElements = elementsConverter.path
      .convert(tw.currentNode as Element);

    const exPaths = calculateElementsPositions(pathElements)
      .map((el) => new ExcalidrawPath({ ...el }));

    scene.elements = scene.elements.concat(exPaths);

    walk(args, tw.nextNode());
  },
};

function walk(args: WalkerArgs, nextNode: Node | null) {
  if (!nextNode) return;

  const nodeName = nextNode.nodeName as keyof typeof walkers;
  if (walkers[nodeName]) {
    walkers[nodeName](args);
  }
}

export type ConversionResult = {
  hasErrors: boolean;
  errors: NodeListOf<Element> | null;
  content: any; // Serialized Excalidraw JSON
};

export const convert = (svgString: string): ConversionResult => {
  const parser = new DOMParser();
  const svgDOM = parser.parseFromString(svgString, "image/svg+xml");

  // was there a parsing error?
  const errorsElements = svgDOM.querySelectorAll("parsererror");
  const hasErrors = errorsElements.length > 0;
  let content = null;

  if (hasErrors) {
    console.error(
      "There were errors while parsing the given SVG: ",
      [...errorsElements].map((el) => el.innerHTML),
    );
  } else {
    const tw = createTreeWalker(svgDOM);
    const scene = new ExcalidrawScene();
    const groups: Group[] = [];

    walk({ tw, scene, groups }, tw.nextNode());

    content = scene.toExJSON();
  }

  return {
    hasErrors,
    errors: hasErrors ? errorsElements : null,
    content,
  };
};
