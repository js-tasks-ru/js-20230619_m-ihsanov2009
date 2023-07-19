class BaseClass {
  element;

  initialize() {
    this.render();
    this.createListeners();
  }

  createListeners() {}

  destroyListeners() {}

  render() {
    this.element = this.createElement(this.getTemplate());
  }

  getTemplate() {
    return ``;
  }

  update() {}

  remove() {
    this.element = null;
  }

  destroy() {
    this.remove();
    this.destroyListeners();
  }

  createElement(template) {
    const divElement = document.createElement("div");
    divElement.innerHTML = template;
    return divElement.firstElementChild;
  }

  createSubElements() {
    for (const item of this.element.querySelectorAll("div[data-element]")) {
      this.subElements[item.dataset.element] = item;
    }
  }
}

export default BaseClass;
