import chroma from "chroma-js";
import { ExcalidrawElementBase } from "./elements/ExcalidrawElement";

const hasAttr = (el: Element) => (attr: string): boolean => {
  return el.hasAttribute(attr);
};

const getAttr = (el: Element) => (attr: string): string => {
  return (el.getAttribute(attr) as unknown) as string;
};

const getAttrAsNumber = (el: Element) => (attr: string): number => {
  return Number(getAttr(el)(attr));
};

const getAttrOr = (el: Element) => <D>(attr: string, backup: D): D => {
  return el.hasAttribute(attr)
    ? ((el.getAttribute(attr) as unknown) as D)
    : backup;
};

const hexWithAlpha = (color: string, alpha: number): string => {
  return chroma(color).alpha(alpha).css();
};

// Presentation Attributes for SVG Elements:
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/Presentation
export function presAttrsToElementValues(
  el: Element,
): Partial<ExcalidrawElementBase> {
  const elVals: Partial<ExcalidrawElementBase> = {};

  const has = hasAttr(el);
  const get = getAttr(el);
  const getNum = getAttrAsNumber(el);
  const getOr = getAttrOr(el);

  // stroke
  if (has("stroke")) {
    const strokeColor = get("stroke");

    elVals.strokeColor = has("stroke-opacity")
      ? hexWithAlpha(strokeColor, getNum("stroke-opacity"))
      : strokeColor;
  }

  // stroke-opacity
  if (has("stroke-opacity")) {
    elVals.strokeColor = hexWithAlpha(
      getOr("stroke", "#000000"),
      getNum("stroke-opacity"),
    );
  }

  // stroke-width
  if (has("stroke-width")) {
    elVals.strokeWidth = getNum("stroke-width");
  }

  // fill
  if (has("fill")) {
    elVals.backgroundColor = get("fill");
  }

  // fill opacity
  if (has("fill-opacity")) {
    elVals.backgroundColor = hexWithAlpha(
      getOr("fill", "#000000"),
      getNum("fill-opacity"),
    );
  }

  // opacity
  if (has("opacity")) {
    elVals.opacity = getNum("opacity");
  }

  return elVals;
}

type FilterAttrs = Partial<
  Pick<ExcalidrawElementBase, "x" | "y" | "width" | "height">
>;

export function filterAttrsToElementValues(el: Element): FilterAttrs {
  const filterVals: FilterAttrs = {};

  const has = hasAttr(el);
  const getNum = getAttrAsNumber(el);

  if (has("x")) filterVals.x = getNum("x");
  if (has("y")) filterVals.y = getNum("y");
  if (has("width")) filterVals.width = getNum("width");
  if (has("height")) filterVals.height = getNum("height");

  return filterVals;
}
