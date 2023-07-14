export default class SortableTable {
  element = null;
  subElements = [];

  constructor(headersConfig, { data = [], sorted = {} } = {}) {
    this.isSortLocally = true;
    this._headerConfig = headersConfig;
    this._data = data;
    this.sorted = sorted;
    this._fieldsAllowedForSort = this._getIsSortableData();
    this._render();
  }

  _render() {
    const divElement = document.createElement("div");
    divElement.innerHTML = this._createMainTemplate();
    this.element = divElement.firstElementChild;
    this.getSubElements();
    this.sortOnClient(true);
    this.addSortEvent();
  }

  getSubElements() {
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

  _createMainTemplate() {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
        ${this._createHeaderTemplate()}
        ${this._createBodyTemplate()}
      </div>
    </div>
    `;
  }

  _createHeaderTemplate() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this._createHeaderDataTemplate()}
      </div>
    `;
  }

  _createHeaderDataTemplate() {
    if (this._headerConfig.length > 0) {
      return this._headerConfig
        .map((item) => this._createHeaderItemTemplate(item))
        .join("");
    }
    return "";
  }

  _getIsSortableData() {
    return this._headerConfig.reduce((arr, item) => {
      if (item.sortable) {
        arr[item.id] = item.sortType;
      }
      return arr;
    }, {});
  }

  _createHeaderItemTemplate(item) {
    return `
      <div class="sortable-table__cell" data-id=${item.id} data-sortable=${
      item.sortable
    } data-order=${
      this.sorted && this.sorted.id === item.id ? this.sorted.order : ""
    }>
        <span>${item.title}</span>
        ${this._createArrowElement(item.id)}
      </div>
    `;
  }

  _createArrowElement(id) {
    return this.sorted.id === id
      ? `<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>`
      : "";
  }

  _createLoaderTemplate() {
    return `
      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
    `;
  }

  _createPlaceHolderTemplate() {
    return `
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>
    `;
  }

  _createBodyTemplate() {
    return `
    <div data-element="body" class="sortable-table__body">
      ${this._createBodyInTemplate()}
    </div>`;
  }

  _createBodyInTemplate() {
    return this._isDataLoaded()
      ? this._data.map((item) => this._createRowTemplate(item)).join("")
      : this._createPlaceHolderTemplate();
  }

  _createRowTemplate(row = {}) {
    if (this._hasConfig()) {
      return `
      <a href="/products/${row.id}" class="sortable-table__row">
        ${this._headerConfig
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

    const type = this._fieldsAllowedForSort[fieldValue];
    switch (type) {
      case "string":
        sortFunc = (a, b) => {
          return orderValue === "asc"
            ? a[fieldValue].localeCompare(b[fieldValue].toUpperCase(), [
                "ru",
                "en",
              ])
            : b[fieldValue]
                .toUpperCase()
                .localeCompare(a[fieldValue].toUpperCase(), ["ru", "en"]);
        };
        break;
      case "number":
        sortFunc = (a, b) => {
          return orderValue === "asc"
            ? a[fieldValue] - b[fieldValue]
            : b[fieldValue] - a[fieldValue];
        };
        break;
      default:
        console.log("Произошла ошибка при сортировке данных.");
    }
    this._data.sort(sortFunc);
    this.updateData();
  }

  updateData(newData = this._data) {
    if (newData !== this._data) {
      this._data = newData;
      this._render();
    }
    if (this._isDataLoaded()) {
      this.subElements.body.innerHTML = this._createBodyInTemplate();
      this.subElements.header.innerHTML = this._createHeaderDataTemplate();
    }
  }

  _hasConfig() {
    return this._headerConfig.length > 0;
  }

  _isDataLoaded() {
    return this._data.length > 0;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
