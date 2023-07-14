class Tooltip {
  element = null;
  static instance = null;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  initialize() {
    this.element = document.createElement("div");
    this.element.className = "tooltip";
    document.addEventListener("pointerover", this.onMouseOver);
    document.addEventListener("pointerout", this.onMouseOut);
  }

  render(text, parent = document.body) {
    this.element.textContent = text;
    parent.append(this.element);
  }

  onMove = (evt) => {
    this.element.style.top = `${evt.clientY}px`;
    this.element.style.left = `${evt.clientX}px`;
  };

  onMouseOver = (evt) => {
    const tooltip = evt.target.dataset.tooltip;
    const parentElement = evt.target;
    if (tooltip) {
      this.render(tooltip, parentElement);
      document.addEventListener("mousemove", this.onMove);
    }
  };

  onMouseOut = () => {
    document.addEventListener("mousemove", this.onMove);
    this.remove();
  };

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    document.removeEventListener("pointerout", this.onMouseOut);
    document.removeEventListener("pointerover", this.onMouseOver);
    document.removeEventListener("mousemove", this.onMove);
    this.element = null;
  }
}

export default Tooltip;
