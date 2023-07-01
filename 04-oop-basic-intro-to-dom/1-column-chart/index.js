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

  _generateTitle() {
    const link = document.createElement("a");
    const titleDiv = document.createElement("div");
    titleDiv.classList.add("column-chart__title");
    titleDiv.textContent = `Total ${this._label}`;
    if (this._link) {
      link.href = this._link;
      link.innerText = "View all";
      link.classList.add("column-chart__link");
      titleDiv.insertAdjacentElement("beforeend", link);
    }
    return titleDiv;
  }

  _generateHeader() {
    const chartHeader = document.createElement("div");
    chartHeader.classList.add("column-chart__header");
    chartHeader.setAttribute("data-element", "header");
    const innerValue = this._formatHeading
      ? this._formatHeading(this._value || "")
      : this._value || "";
    chartHeader.textContent = innerValue;
    return chartHeader;
  }

  _generateDataColumns() {
    this._data = this._hasData() && this._getObjectFromData(this._data);
    const chartDiv = document.createElement("div");
    chartDiv.classList.add("column-chart__chart");
    chartDiv.setAttribute("data-element", "body");
    this._hasData() &&
      this._data.map((item) => {
        const colDiv = document.createElement("div");
        colDiv.style = `--value: ${item.value}`;
        colDiv.setAttribute("data-tooltip", `${item.percent}`);
        return chartDiv.insertAdjacentElement("beforeend", colDiv);
      });
    return chartDiv;
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

  _hasData() {
    return this._data && this._data.length > 0;
  }

  update(newData) {
    this._data = newData;
    return this.render();
  }

  render() {
    const chartDiv = document.createElement("div");
    chartDiv.classList.add("column-chart__container");
    chartDiv.insertAdjacentElement("afterbegin", this._generateHeader());
    chartDiv.insertAdjacentElement("beforeend", this._generateDataColumns());
    this.element = document.createElement("div");
    const columnChartClasses = this._hasData()
      ? "column-chart"
      : "column-chart column-chart_loading";
    this.element.className = columnChartClasses;
    this.element.style = `--chart-height: ${this.chartHeight}`;
    this.element.insertAdjacentElement("afterbegin", this._generateTitle());
    this.element.insertAdjacentElement("beforeend", chartDiv);
  }

  remove() {
    this.element = null;
  }

  destroy() {
    this.remove();
  }
}
