import BaseClass from "../../baseClass/index.js";
import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class ColumnChart extends BaseClass {
  chartHeight = 50;
  element = null;
  data = [];
  columns = [];
  subElements = {};

  constructor({
    url = "",
    range = {},
    label = "",
    link = "",
    value = 0,
    formatHeading = (a) => a,
  } = {}) {
    super();
    this.url = url;
    this.label = label;
    this.link = link;
    this.value = value;
    this.range = range;
    this.formatHeading = formatHeading;

    this.render();
    this.createSubElements();
    this.loadData();
  }

  getTemplate() {
    return `<div class="column-chart column-chart_loading"
      style="--chart-height: ${this.chartHeight}">
        ${this.createTitleTemplate()}
        <div class="column-chart__container">
          ${this.generateHeader()}
          ${this.createRootTemplate()}
        </div>
      </div>
  `;
  }

  createTitleTemplate() {
    const linkElement = this.link
      ? `<a href="${this.link}" class="column-chart__link">View all</a>`
      : "";
    return `<div class="column-chart__title">Total ${this.label}${linkElement}</div>`;
  }

  generateHeader() {
    const innerValue = this.formatHeading
      ? this.formatHeading(this.value)
      : this.value;
    return `<div data-element="header" class="column-chart__header">${innerValue}</div>`;
  }

  createRootTemplate() {
    return `<div data-element="body" class="column-chart__chart">${this.getChartsTemplate()}</div>`;
  }

  getChartsTemplate() {
    return this.hasData()
      ? this.columns
          .map(
            (item) =>
              `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`
          )
          .join("")
      : "";
  }

  getObjectFromData(data = this.data) {
    const maxData = Math.max(...data);
    return data.map((item) => ({
      percent: ((item / maxData) * 100).toFixed(0) + "%",
      value: String(Math.floor((item * this.chartHeight) / maxData)),
    }));
  }

  updateData(data) {
    const loadedData = data && Object.values(data);
    if (loadedData && loadedData.length > 0) {
      this.data = data;
      this.columns = this.getObjectFromData(loadedData);
      this.value = loadedData.reduce((acc, value) => acc + value);

      this.updateElement();
    }
  }

  updateElement() {
    if (this.value) {
      this.subElements.header.innerHTML = this.generateHeader();
      this.subElements.body.innerHTML = this.getChartsTemplate();
      this.element.classList.remove("column-chart_loading");
    } else {
      this.element.classList.add("column-chart_loading");
    }
  }

  hasData(data = this.data) {
    return data && this.columns.length > 0;
  }

  async loadData() {
    this.element.classList.add("column-chart_loading");
    const query = new URL(this.url, BACKEND_URL);
    if (this.range.from) {
      query.searchParams.set("from", this.range.from);
    }
    if (this.range.to) {
      query.searchParams.set("to", this.range.to);
    }
    const data = await fetchJson(query);
    this.updateData(data);

    return data;
  }

  async update(from, to) {
    const isToRangeNew =
      !this.range?.to || this.range.to.getTime() !== to.getTime();
    const isFromRangeNew =
      !this.range?.from || this.range.from.getTime() !== from.getTime();

    if (isToRangeNew || isFromRangeNew) {
      this.range = { from, to };
      return await this.loadData();
    }
    return this.data;
  }
}
