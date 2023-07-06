export default class ColumnChart {
  element = null;
  chartHeight = 50;

  constructor({
    data = null,
    label = "",
    value = 0,
    link = "",
    formatHeading = null,
  } = {}) {
    this._data = data;
    this._label = label;
    this._value = value;
    this._link = link;
    this._formatHeading = formatHeading;
    this.element = document.createElement("div");
    this.render();
  }

  _createTitleElement() {
    const linkElement = document.createElement("a");
    const titleDivElement = document.createElement("div");
    titleDivElement.classList.add("column-chart__title");
    titleDivElement.textContent = `Total ${this._label}`;
    if (this._link) {
      linkElement.href = this._link;
      linkElement.innerText = "View all";
      linkElement.classList.add("column-chart__link");
      titleDivElement.insertAdjacentElement("beforeend", linkElement);
    }
    return titleDivElement;
  }

  _generateHeader() {
    const chartHeaderElement = document.createElement("div");
    chartHeaderElement.classList.add("column-chart__header");
    chartHeaderElement.setAttribute("data-element", "header");
    const innerValue = this._formatHeading
      ? this._formatHeading(this._value)
      : this._value;
    chartHeaderElement.textContent = innerValue;
    return chartHeaderElement;
  }

  _generateDataColumns() {
    if (this._hasData()) {
      this._getObjectFromData(this._data);
    }
    this._data = this._hasData() && this._getObjectFromData(this._data);
    const chartDivElement = document.createElement("div");
    chartDivElement.classList.add("column-chart__chart");
    chartDivElement.setAttribute("data-element", "body");
    if (this._hasData()) {
      const columnElements = this._data.map((item) => {
        const colDivElement = document.createElement("div");
        colDivElement.style = `--value: ${item.value}`;
        colDivElement.setAttribute("data-tooltip", `${item.percent}`);
        return colDivElement;
      });
      columnElements.forEach(columnElement => {
        return chartDivElement.insertAdjacentElement("beforeend", columnElement);
      });
    }
    return chartDivElement;
  }

  _getObjectFromData(data = this._data) {
    const maxData = Math.max(...data);
    return data.map((item) => {
      return {
        percent: ((item / maxData) * 100).toFixed(0) + "%",
        value: String(Math.floor((item * this.chartHeight) / maxData)),
      };
    });
  }

  _createContainerElement() {
    const chartElement = document.createElement("div");
    chartElement.classList.add("column-chart__container");
    return chartElement;
  }

  _createRootElement() {
    const rootElement = document.createElement("div");
    const columnChartClasses = this._hasData()
      ? "column-chart"
      : "column-chart column-chart_loading";
    rootElement.className = columnChartClasses;
    rootElement.style = `--chart-height: ${this.chartHeight}`;
    return rootElement;
  }

  _hasData() {
    return this._data && this._data.length > 0;
  }

  update(newData) {
    this._data = newData;
    return this.render();
  }

  render() {
    const containerElement = this._createContainerElement();
    const rootElement = this._createRootElement();

    containerElement.insertAdjacentElement("afterbegin", this._generateHeader());
    containerElement.insertAdjacentElement("beforeend", this._generateDataColumns());

    rootElement.insertAdjacentElement("afterbegin", this._createTitleElement());
    rootElement.insertAdjacentElement("beforeend", containerElement);

    this.element = rootElement;
  }

  remove() {
    this.element = null;
  }

  destroy() {
    this.remove();
  }
}
