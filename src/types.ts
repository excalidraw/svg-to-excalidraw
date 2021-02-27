export type PathCommand = {
  type: string;
  parameters: number[];
  isRelative: boolean;
};

export type RawElement = {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  points: number[][];
  backgroundColor: string;
  strokeColor: string;
};

export type ElementBoundaries = {
  x: number;
  y: number;
  height: number;
  width: number;
};

export type ExcalidrawElement = RawElement & {
  angle: number;
  fillStyle: string;
  opacity: number;
  roughness: number;
  seed: number;
  strokeSharpness: string;
  strokeWidth: number;
};

export type ExcalidrawScene = {
  type: "excalidraw";
  version: 2;
  source: "https://excalidraw.com";
  elements: ExcalidrawElement[];
};
