import BaseClass from "../../baseClass/index.js";

export default class ColumnChart extends BaseClass {
  chartHeight = 50;

  constructor({
    data = null,
    label = "",
    value = 0,
    link = "",
    formatHeading = null,
  } = {}) {
    super();
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.element = document.createElement("div");
    this.render();
  }

  createTitleElement() {
    const linkElement = document.createElement("a");
    const titleDivElement = document.createElement("div");
    titleDivElement.classList.add("column-chart__title");
    titleDivElement.textContent = `Total ${this.label}`;
    if (this.link) {
      linkElement.href = this.link;
      linkElement.innerText = "View all";
      linkElement.classList.add("column-chart__link");
      titleDivElement.insertAdjacentElement("beforeend", linkElement);
    }
    return titleDivElement;
  }

  generateHeader() {
    const chartHeaderElement = document.createElement("div");
    chartHeaderElement.classList.add("column-chart__header");
    chartHeaderElement.setAttribute("data-element", "header");
    const innerValue = this.formatHeading
      ? this.formatHeading(this.value)
      : this.value;
    chartHeaderElement.textContent = innerValue;
    return chartHeaderElement;
  }

  generateDataColumnsElement() {
    if (this.hasData()) {
      this.getObjectFromData(this._data);
    }
    this.data = this.hasData() && this.getObjectFromData(this.data);
    const chartDivElement = document.createElement("div");
    chartDivElement.classList.add("column-chart__chart");
    chartDivElement.setAttribute("data-element", "body");
    if (this.hasData()) {
      const columnElements = this.data.map((item) => {
        const colDivElement = document.createElement("div");
        colDivElement.style = `--value: ${item.value}`;
        colDivElement.setAttribute("data-tooltip", `${item.percent}`);
        return colDivElement;
      });
      columnElements.forEach((columnElement) => {
        return chartDivElement.insertAdjacentElement(
          "beforeend",
          columnElement
        );
      });
    }
    return chartDivElement;
  }

  getObjectFromData(data = this.data) {
    const maxData = Math.max(...data);
    return data.map((item) => {
      return {
        percent: ((item / maxData) * 100).toFixed(0) + "%",
        value: String(Math.floor((item * this.chartHeight) / maxData)),
      };
    });
  }

  createContainerElement() {
    const chartElement = document.createElement("div");
    chartElement.classList.add("column-chart__container");
    return chartElement;
  }

  createRootElement() {
    const rootElement = document.createElement("div");
    const columnChartClasses = this.hasData()
      ? "column-chart"
      : "column-chart column-chart_loading";
    rootElement.className = columnChartClasses;
    rootElement.style = `--chart-height: ${this.chartHeight}`;
    return rootElement;
  }

  hasData() {
    return this.data && this.data.length > 0;
  }

  update(newData) {
    this.data = newData;
    return this.render();
  }

  render() {
    const containerElement = this.createContainerElement();
    const rootElement = this.createRootElement();

    containerElement.insertAdjacentElement("afterbegin", this.generateHeader());
    containerElement.insertAdjacentElement(
      "beforeend",
      this.generateDataColumnsElement()
    );

    rootElement.insertAdjacentElement("afterbegin", this.createTitleElement());
    rootElement.insertAdjacentElement("beforeend", containerElement);

    this.element = rootElement;
  }
}
