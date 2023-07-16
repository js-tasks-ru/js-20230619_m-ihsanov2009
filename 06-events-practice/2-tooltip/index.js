import BaseClass from "../../baseClass/index.js";

class Tooltip extends BaseClass {
  static instance = null;

  constructor() {
    super();
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  initialize() {
    this.element = document.createElement("div");
    this.element.className = "tooltip";
    this.createListeners();
  }

  createListeners() {
    document.addEventListener("pointerover", this.onTextMouseOver);
    document.addEventListener("pointerout", this.onTextMouseOut);
  }

  render(text, parent = document.body) {
    this.element.textContent = text;
    parent.append(this.element);
  }

  onMouseMove = (evt) => {
    this.element.style.top = `${evt.clientY}px`;
    this.element.style.left = `${evt.clientX}px`;
  };

  onTextMouseOver = (evt) => {
    const tooltip = evt.target.dataset.tooltip;
    const parentElement = evt.target;
    if (tooltip) {
      this.render(tooltip, parentElement);
      document.addEventListener("mousemove", this.onMouseMove);
    }
  };

  onTextMouseOut = () => {
    document.addEventListener("mousemove", this.onMouseMove);
    this.remove();
  };

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroyListeners() {
    document.removeEventListener("pointerout", this.onTextMouseOut);
    document.removeEventListener("pointerover", this.onTextMouseOver);
    document.removeEventListener("mousemove", this.onMouseMove);
  }
}

export default Tooltip;
