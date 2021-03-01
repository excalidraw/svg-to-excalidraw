/* eslint-disable @typescript-eslint/no-inferrable-types */
import { randomId, randomInteger } from '../utils';

import {
  GroupId,
  FillStyle,
  StrokeStyle,
  StrokeSharpness,
  ExcalidrawLinearElement,
} from "../types";

export type ExcalidrawElementConstructorArgs = Omit<
  Partial<ExcalidrawElement>,
  "seed" | "version" | "versionNonce" | "isDeleted"
>;

class ExcalidrawElement {
  [key: string]: any;

  id: string = randomId();
  x: number = 0;
  y: number = 0;
  strokeColor: string = "#000000";
  backgroundColor: string = "#FFFFFF";
  fillStyle: FillStyle = "solid";
  strokeWidth: number = 1;
  strokeStyle: StrokeStyle = "solid";
  strokeSharpness: StrokeSharpness = "sharp";
  roughness: number = 1;
  opacity: number = 100;
  width: number = 0;
  height: number = 0;
  angle: number = 0;
  /** Random integer used to seed shape generation so that the roughjs shape
      doesn't differ across renders. */
  seed: number = randomInteger();
  /** Integer that is sequentially incremented on each change. Used to reconcile
      elements during collaboration or when saving to server. */
  version: number = 0;
  /** Random integer that is regenerated on each change.
      Used for deterministic reconciliation of updates during collaboration,
      in case the versions (see above) are identical. */
  versionNonce: number = 0;
  isDeleted = false;
  /** List of groups the element belongs to.
      Ordered from deepest to shallowest. */
  groupIds: GroupId[] = [];
  /** Ids of (linear) elements that are bound to this element. */
  boundElementIds: ExcalidrawLinearElement["id"][] | null = null;

  constructor(args: ExcalidrawElementConstructorArgs) {
    Object.entries(args).forEach(([key, val]) => {
      if (val) {
        this[key] = val;
      }
    });
  }
}

export default ExcalidrawElement;
