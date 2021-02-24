export type ExcalidrawDrawElement = {
  type: "draw",
  x: number,
  y: number,
  width: number,
  height: number,
  points: number[][],
};

export type ElementBoundaries = {
  x: number,
  y: number,
  height: number,
  width: number,
};

export type Coordinates = number[];

export type ExcalidrawElement =
  | ExcalidrawDrawElement;
