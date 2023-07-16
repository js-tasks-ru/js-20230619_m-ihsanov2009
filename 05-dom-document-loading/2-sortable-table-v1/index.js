import BaseClass from "../../baseClass/index.js";

export default class SortableTable extends BaseClass {
  subElements = [];

  constructor(headerConfig = [], data = []) {
    super();
    this.headerConfig = headerConfig;
    this.data = data;
    this.sortField = { fieldValue: "", orderValue: "" };
    this.fieldsAllowedForSort = this.getIsSortableData();
    this.render();
    this.getSubElements();
  }

  getSubElements() {
    for (const item of this.element.querySelectorAll("div[data-element]")) {
      this.subElements[item.dataset.element] = item;
    }
  }

  getTemplate() {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
        ${this.createHeaderTemplate()}
        ${this.createBodyTemplate()}
      </div>
    </div>
    `;
  }

  createHeaderTemplate() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.createHeaderDataTemplate()}
      </div>
    `;
  }

  createHeaderDataTemplate() {
    if (this.headerConfig.length > 0) {
      return this.headerConfig
        .map((item) => this.createHeaderItemTemplate(item))
        .join("");
    }
    return "";
  }

  getIsSortableData() {
    return this.headerConfig.reduce((arr, item) => {
      if (item.sortable) {
        arr[item.id] = item.sortType;
      }
      return arr;
    }, {});
  }

  createHeaderItemTemplate(item) {
    return `
      <div class="sortable-table__cell" data-id=${item.id} data-sortable=${item.sortable} data-order=${this.sortField.orderValue}>
        <span>${item.title}</span>
      </div>
    `;
  }

  createLoaderTemplate() {
    return `
      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
    `;
  }

  createPlaceHolderTemplate() {
    return `
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>
    `;
  }

  createBodyTemplate() {
    return `
    <div data-element="body" class="sortable-table__body">
      ${this.createBodyInTemplate()}
    </div>`;
  }

  createBodyInTemplate() {
    return this.isDataLoaded()
      ? this.data.map((item) => this.createRowTemplate(item)).join("")
      : this.createPlaceHolderTemplate();
  }

  createRowTemplate(row = {}) {
    if (this.hasConfig()) {
      return `
      <a href="/products/${row.id}" class="sortable-table__row">
        ${this.headerConfig
          .map((item) => {
            return item.template
              ? item.template(row[item.id])
              : `<div class="sortable-table__cell">${row[item.id] || ""}</div>`;
          })
          .join("")}
    </a>`;
    }
    return "";
  }

  sort(fieldValue, orderValue) {
    if (
      this.sortField.fieldValue !== fieldValue ||
      this.sortField.orderValue !== orderValue
    ) {
      this.sortField = { fieldValue: fieldValue, orderValue: orderValue };
      const type = this.fieldsAllowedForSort[fieldValue];
      switch (type) {
        case "string":
          this.sortStrings(fieldValue, orderValue);
          break;
        case "number":
          this.data.sort((a, b) => {
            return orderValue === "asc"
              ? a[fieldValue] - b[fieldValue]
              : b[fieldValue] - a[fieldValue];
          });
          break;
        default:
          console.log("Нет параметра для сортировки");
      }
      this.update();
    }
  }

  update(newData = this.data) {
    if (newData !== this.data) {
      this.data = newData;
      this.render();
    }
    if (this.isDataLoaded()) {
      this.subElements.body.innerHTML = this.createBodyInTemplate();
      this.subElements.header.innerHTML = this.createHeaderDataTemplate();
    }
  }

  sortStrings(fieldValue, param = "asc") {
    return this.data.sort((a, b) =>
      param === "desc"
        ? b[fieldValue].localeCompare(a[fieldValue], "ru-RU-u-kf-upper")
        : a[fieldValue].localeCompare(b[fieldValue], "ru-RU-u-kf-upper")
    );
  }

  hasConfig() {
    return this.headerConfig.length > 0;
  }

  isDataLoaded() {
    return this.data.length > 0;
  }
}
