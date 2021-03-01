import ExcalidrawEllipse from "./ExcalidrawEllipse";
import ExcalidrawPath from "./ExcalidrawPath";
import ExcalidrawRectangle from "./ExcalidrawRectangle";

type ExcalidrawElement =
  | ExcalidrawEllipse
  | ExcalidrawPath
  | ExcalidrawRectangle;

class ExcalidrawScene {
  type = "excalidraw";
  version = 2;
  source = "https://excalidraw.com";
  elements: ExcalidrawElement[] = [];

  constructor(elements = []) {
    this.elements = elements;
  }

  toExJSON(): any {
    return {
      ...this,
      elements: this.elements.map((el) => ({ ...el })),
    };
  }
}

export default ExcalidrawScene;
