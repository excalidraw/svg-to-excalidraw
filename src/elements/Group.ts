import { randomId } from "../utils";

const groupAttrs = {
  fill: "backgroundColor",
  stroke: "strokeColor",
  "stroke-width": "strokeWidth",
} as const;

const groupAttrKeys = Object.keys(groupAttrs);

export function getGroupAttrs(groups: Group[]): any {
  return groups.reduce((acc, { element }) => {
    for (const attr of groupAttrKeys) {
      if (element.hasAttribute(attr)) {
        const val = element.getAttribute(attr) as string;
        // @ts-ignore
        acc[groupAttrs[attr]] = val;
      }
    }

    return acc;
  }, {} as { [key: keyof typeof groupAttrs]: string });
}

class Group {
  id = randomId();

  element: Element;

  constructor(element: Element) {
    this.element = element;
  }
}

export default Group;
