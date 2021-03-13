import { randomId } from "../utils";

class Def {
  id = randomId();

  element: Element;

  constructor(element: Element) {
    this.element = element;
  }
}

export default Def;
