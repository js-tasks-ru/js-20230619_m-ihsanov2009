import BaseClass from "../../baseClass/index.js";

export default class DoubleSlider extends BaseClass {
  static MAX_PERCENT = 100;
  static MIN_PERCENT = 0;
  subElements = {};

  constructor({
    min = 0,
    max = 300,
    formatValue = (value) => "$" + value,
    selected = {
      from: min,
      to: max,
    },
    step = 0,
  } = {}) {
    super();
    this.values = selected;
    this.selected = selected;
    this.min = min;
    this.max = max;
    this.step = step > 0 ? step : 0;
    this.formatValue = formatValue;
    this.initialize();
  }

  getTemplate() {
    return `
      <div class="range-slider">
        <span data-element="from">${this.formatValue(this.values.from)}</span>
         <div class="range-slider__inner" >
            <span class="range-slider__progress" style="left: ${
              this.left
            }%; right:${DoubleSlider.MAX_PERCENT - this.right}%"></span>
            <span class="range-slider__thumb-left" style="left: ${
              this.left
            }%"></span>
            <span class="range-slider__thumb-right" style="right:${
              DoubleSlider.MAX_PERCENT - this.right
            }%"></span>
          </div>
         <span data-element="to">${this.formatValue(this.values.to)}</span>
      </div>
    `;
  }

  handlePointerUp = () => {
    this.clickTarget = {};
    document.removeEventListener("mousemove", this.onSliderMove);
  };

  createListeners() {
    this.subElements.left.addEventListener(
      "pointerdown",
      this.onSliderPointerDown
    );
    this.subElements.right.addEventListener(
      "pointerdown",
      this.onSliderPointerDown
    );
    document.addEventListener("pointerup", this.handlePointerUp);
  }

  destroyListeners() {
    document.removeEventListener("pointermove", this.onSliderMove);
    document.removeEventListener("pointerup", this.handlePointerUp);
  }

  render() {
    super.render();
    this.range = this.max - this.min;
    this.initialRight = Number(
      ((this.values.to / (this.max + this.min)) * 100).toFixed(this.step)
    );
    this.initialLeft = Number(
      ((this.values.from / (this.max + this.min)) * 100).toFixed(this.step)
    );

    for (const item of this.element.querySelectorAll(
      '[class^="range-slider"]'
    )) {
      this.subElements[
        item.className.replace("range-slider__", "").replace("thumb-", "")
      ] = item;
    }
    let i = 0;
    for (const item of this.element.querySelectorAll("span")) {
      if (!item.className) {
        this.subElements[i++] = item;
      }
    }
  }

  onSliderMove = (event) => {
    const percentFromPixel = Number(
      (event.clientX - this.baseCoords.x) / this.percentStep
    ).toFixed(this.step);
    if (this.clickTarget === this.subElements.right) {
      this.right = percentFromPixel;
    }
    if (this.clickTarget === this.subElements.left) {
      this.left = percentFromPixel;
    }
  };

  onSliderPointerDown = (event) => {
    this.clickTarget = event.target.closest("span");
    this.baseCoords = this.subElements.inner.getBoundingClientRect();
    if (!this.baseCoords.x) {
      this.baseCoords.x = this.baseCoords.top;
    }
    this.percentStep = this.baseCoords.width / DoubleSlider.MAX_PERCENT;
    document.addEventListener("pointermove", this.onSliderMove);
  };

  updateElements() {
    this.subElements.left.style.left = this.left + "%";
    this.subElements.right.style.right = `${
      DoubleSlider.MAX_PERCENT - this.right
    }%`;
    this.subElements.progress.style.left = this.left + "%";
    this.subElements.progress.style.right = `${
      DoubleSlider.MAX_PERCENT - this.right
    }%`;

    this.subElements[0].textContent = this.formatValue(this.values.from);
    this.subElements[1].textContent = this.formatValue(this.values.to);
  }

  updateValues() {
    this.values = { from: this.getFromValue(), to: this.getToValue() };
  }

  dispatch() {
    let customEvent = new CustomEvent("range-select", {
      detail: this.values,
      bubbles: true,
    });
    this.element.dispatchEvent(customEvent);
  }

  getFromValue() {
    const calcFromValue =
      this.min + (this.range * this.left) / DoubleSlider.MAX_PERCENT;
    return calcFromValue;
  }

  getToValue() {
    const calcToValue =
      this.min + (this.range * this.right) / DoubleSlider.MAX_PERCENT;
    return calcToValue;
  }

  get left() {
    return this.initialLeft;
  }
  get right() {
    return this.initialRight;
  }

  set left(value) {
    const prevLeft = this.left;
    if (value <= DoubleSlider.MIN_PERCENT) {
      this.initialLeft = DoubleSlider.MIN_PERCENT;
    } else if (value >= this.right) {
      this.initialLeft = this.right;
    } else {
      this.initialLeft = value;
    }
    if (prevLeft !== this.left) {
      this.update();
    }
  }

  set right(value) {
    const prevRight = this.right;
    if (value >= DoubleSlider.MAX_PERCENT) {
      this.initialRight = DoubleSlider.MAX_PERCENT;
    } else if (value <= this.left) {
      this.initialRight = this.left;
    } else {
      this.initialRight = value;
    }
    if (prevRight !== this.right) {
      this.update();
    }
  }

  update() {
    this.updateValues();
    this.updateElements();
    this.dispatch();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.clickTarget = {};
    this.values = {};
    this.destroyListeners();
  }
}
