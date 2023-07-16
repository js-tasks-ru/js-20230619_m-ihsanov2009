import BaseClass from "../../baseClass/index.js";

export default class SortableTable extends BaseClass {
  subElements = [];

  constructor(headersConfig, { data = [], sorted = {} } = {}) {
    super();
    this.isSortLocally = true;
    this.headerConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.fieldsAllowedForSort = this.getSortableItems();
    this.render();
    this.createSubElements();
    this.sortOnClient(true);
    this.addSortEvent();
  }

  createSubElements() {
    for (const item of this.element.querySelectorAll("div[data-element]")) {
      this.subElements[item.dataset.element] = item;
    }
  }

  addSortEvent() {
    this.subElements.header.addEventListener("pointerdown", (event) => {
      const target = event.target.closest("div");

      if (target.dataset.sortable) {
        this.sorted = {
          id: target.dataset.id,
          order: this.sorted.order === "asc" ? "desc" : "asc",
        };
        this.sort();
      }
    });
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

  getSortableItems() {
    return this.headerConfig.reduce((arr, item) => {
      if (item.sortable) {
        arr[item.id] = item.sortType;
      }
      return arr;
    }, {});
  }

  createHeaderItemTemplate(item) {
    return `
      <div class="sortable-table__cell" data-id=${item.id} data-sortable=${
      item.sortable
    } data-order=${
      this.sorted && this.sorted.id === item.id ? this.sorted.order : ""
    }>
        <span>${item.title}</span>
        ${this.createArrowElement(item.id)}
      </div>
    `;
  }

  createArrowElement(id) {
    return this.sorted.id === id
      ? `<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>`
      : "";
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

  sort() {
    if (this.isSortLocally) {
      this.sortOnClient();
    } else {
      this.sortOnServer();
    }
  }

  sortOnClient() {
    let sortFunc;
    const fieldValue = this.sorted.id;
    const orderValue = this.sorted.order;

    const type = this.fieldsAllowedForSort[fieldValue];
    switch (type) {
      case "string":
        sortFunc = (a, b) =>
          this.sortFunctionForString(a, b, fieldValue, orderValue);
        break;
      case "number":
        sortFunc = (a, b) =>
          this.sortFunctionForNumber(a, b, fieldValue, orderValue);
        break;
      default:
        throw new Error("Произошла ошибка при сортировке данных");
    }
    this.data.sort(sortFunc);
    this.update(this.data);
  }

  sortFunctionForString(a, b, fieldValue, orderValue) {
    return orderValue === "asc"
      ? a[fieldValue].localeCompare(b[fieldValue].toUpperCase(), ["ru", "en"])
      : b[fieldValue]
          .toUpperCase()
          .localeCompare(a[fieldValue].toUpperCase(), ["ru", "en"]);
  }

  sortFunctionForNumber(a, b, fieldValue, orderValue) {
    return orderValue === "asc"
      ? a[fieldValue] - b[fieldValue]
      : b[fieldValue] - a[fieldValue];
  }

  update(newData) {
    if (newData !== this.data) {
      this.data = newData;
      this.render();
    }
    if (this.isDataLoaded()) {
      this.subElements.body.innerHTML = this.createBodyInTemplate();
      this.subElements.header.innerHTML = this.createHeaderDataTemplate();
    }
  }

  hasConfig() {
    return this.headerConfig.length > 0;
  }

  isDataLoaded() {
    return this.data.length > 0;
  }
}
