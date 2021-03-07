import { vec3 } from "gl-matrix";
import elementsConverter from "./elements";
import { RawElement } from "./types";
import { safeNumber } from "./utils";
import ExcalidrawScene from "./elements/ExcalidrawScene";
import Group, { getGroupAttrs } from "./elements/Group";
import {
  ExcalidrawElementBase,
  ExcalidrawRectangle,
  createExRect,
  createExEllipse,
  createExLine,
  ExcalidrawEllipse,
  ExcalidrawLine,
} from "./elements/ExcalidrawElement";
import {
  presAttrsToElementValues,
  filterAttrsToElementValues,
} from "./attributes";
import { getTransformMatrix } from "./transform";

const SUPPORTED_TAGS = [
  "svg",
  "path",
  "g",
  "use",
  "circle",
  "ellipse",
  "rect",
  "polyline",
];

const calculateElementsPositions = (elements: RawElement[]): RawElement[] => {
  const { x: minX, y: minY } = elements.reduce(
    (minPoint, { x, y }) => {
      if (x < minPoint.x) {
        minPoint.x = x;
      }

      if (y < minPoint.y) {
        minPoint.y = y;
      }

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

export function createTreeWalker(dom: Node): TreeWalker {
  return document.createTreeWalker(dom, NodeFilter.SHOW_ALL, {
    acceptNode: nodeValidator,
  });
}

type WalkerArgs = {
  root: Document;
  tw: TreeWalker;
  scene: ExcalidrawScene;
  groups: Group[];
};

function attrOr<D>(el: Element, attr: string, backup: D): D {
  return el.hasAttribute(attr)
    ? ((el.getAttribute(attr) as unknown) as D)
    : backup;
}

const presAttrs = (
  el: Element,
  groups: Group[],
): Partial<ExcalidrawElementBase> => {
  return {
    ...getGroupAttrs(groups),
    ...presAttrsToElementValues(el),
    ...filterAttrsToElementValues(el),
  };
};

const skippedUseAttrs = ["id"];
const allwaysPassedUseAttrs = [
  "x",
  "y",
  "width",
  "height",
  "href",
  "xlink:href",
];

const getDefElWithCorrectAttrs = (defEl: Element, useEl: Element): Element => {
  /*
  Situation 1: Attr is set on defEl, NOT on useEl
    - result: use defEl attr
  Situation 2: Attr is on useEl, NOT on defEl
    - result: use the useEl attr
  Situation 3: Attr is on both useEl and defEl
    - result: use the defEl attr (Unless x, y, width, height, href, xlink:href)
  */

  const finalEl = [...useEl.attributes].reduce((el, attr) => {
    if (skippedUseAttrs.includes(attr.value)) {
      return el;
    }

    // Does defEl have the attr? If so, use it, else use the useEl attr
    if (
      !defEl.hasAttribute(attr.name) ||
      allwaysPassedUseAttrs.includes(attr.name)
    ) {
      el.setAttribute(attr.name, useEl.getAttribute(attr.name) || "");
    }
    return el;
  }, defEl.cloneNode() as Element);

  return finalEl;
};

function walkEllipse(args: WalkerArgs): void {
  const { tw, scene, groups } = args;
  const el = tw.currentNode as Element;
  const diameter = Number(el.getAttribute("r")) * 2;

  const ellipse: ExcalidrawEllipse = {
    ...createExEllipse(),
    ...presAttrs(el, groups),
    // Need to actual calculate the cx and cy (center point)
    x: Number(el.getAttribute("cx")),
    y: Number(el.getAttribute("cy")),
    width: diameter,
    height: diameter,
    groupIds: groups.map((g) => g.id),
  };

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

  /*
  "Most attributes on use do not override those already on the element
  referenced by use. (This differs from how CSS style attributes override
  those set 'earlier' in the cascade). Only the attributes x, y, width,
  height and href on the use element will override those set on the
  referenced element. However, any other attributes not set on the referenced
  element will be applied to the use element."
  */
  use: (args: WalkerArgs) => {
    const { root, tw, scene, groups } = args;
    const useEl = tw.currentNode as Element;

    const id = useEl.getAttribute("href") || useEl.getAttribute("xlink:href");

    if (!id) {
      throw new Error("unable to get id of use element");
    }

    const defEl = root.querySelector(id);

    if (!defEl) {
      throw new Error(`unable to find def element with id: ${id}`);
    }

    const tempScene = new ExcalidrawScene();

    const defArgs = {
      ...args,
      scene: tempScene,
      tw: createTreeWalker(defEl),
    };

    walk(defArgs, defEl);

    const exEl = tempScene.elements.pop();

    if (!exEl) {
      throw new Error("Unable to create ex element");
    }

    const finalEl = getDefElWithCorrectAttrs(defEl, useEl);

    const ex = {
      ...exEl,
      ...presAttrs(finalEl, groups),
    };

    scene.elements.push(ex);

    walk(args, args.tw.nextNode());
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

    const line: ExcalidrawLine = {
      ...createExLine(),
      ...groupAttrs,
    };

    scene.elements.push(line);

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
    const isRound = el.hasAttribute("rx") || el.hasAttribute("ry");

    const groupAttrs = getGroupAttrs(groups);
    const rect: ExcalidrawRectangle = {
      ...createExRect(),
      x: Number(attrOr<number>(el, "x", 0)),
      y: Number(attrOr<number>(el, "y", 0)),
      width: Number(attrOr<number>(el, "width", 0)),
      height: Number(attrOr<number>(el, "height", 0)),
      strokeSharpness: isRound ? "round" : "sharp",
      ...groupAttrs,
    };

    scene.elements.push(rect);

    walk(args, args.tw.nextNode());
  },

  path: (args: WalkerArgs) => {
    const { tw, scene, groups } = args;
    const el = tw.currentNode as Element;
    const pathElements = elementsConverter.path.convert(el);

    const mat = getTransformMatrix(el, groups);

    const exPaths = calculateElementsPositions(pathElements).map((exp) => {
      exp.points = exp.points.map(([x, y]) => {
        const [newX, newY] = vec3.transformMat4(
          vec3.create(),
          vec3.fromValues(x, y, 1),
          mat,
        );

        return [newX, newY];
      });

      return {
        ...exp,
        ...presAttrs(el, groups),
      };
    });

    console.log("exPaths", exPaths);

    scene.elements = scene.elements.concat(exPaths);

    walk(args, tw.nextNode());
  },
};

export function walk(args: WalkerArgs, nextNode: Node | null): void {
  if (!nextNode) {
    return;
  }

  const nodeName = nextNode.nodeName as keyof typeof walkers;
  if (walkers[nodeName]) {
    walkers[nodeName](args);
  }
}
