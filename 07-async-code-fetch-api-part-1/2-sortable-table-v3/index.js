import BaseClass from "../../baseClass/index.js";
import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable extends BaseClass {
  LOAD_COUNT = 30;
  SCROLL_LOAD_START = 50;
  subElements = [];
  isScrolled = false;
  isLoading = false;
  controller = new AbortController();

  constructor(
    headerConfig = [],
    {
      url = "",
      range = { to: new Date(), from: new Date() },
      isSortLocally = !Boolean(url),
      data = [],
      sorted = {
        id: headerConfig.find((item) => item.sortable).id,
        order: "asc",
      },
    }
  ) {
    super();
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.url = url;
    this.range = range;
    this.render();
  }

  async render() {
    this.element = this.createElement(this.getTemplate());
    this.createSubElements();
    this.createListeners();
    await this.loadData();
  }

  createListeners() {
    this.subElements.header.addEventListener("pointerdown", this.handleTableSort, {
      signal: this.controller.signal,
    });

    window.addEventListener("scroll", this.handleTableScroll, {
      signal: this.controller.signal,
    });
  }

  handleTableSort = (event) => {
    const target = event.target.closest("[data-sortable=true]");

    this.isScrolled = false;
    if (!this.isSortLocally) {
      this.data = [];
    }

    if (target) {
      this.sorted = {
        id: target.dataset.id,
        order: this.sorted.order === "asc" ? "desc" : "asc",
      };
      this.sort();
    }
  };


  handleTableScroll = async () => {
    const { bottom } = document.documentElement.getBoundingClientRect();
    if (
      !this.isLoading &&
      !this.isSortLocally &&
      bottom - window.innerHeight < this.SCROLL_LOAD_START
    ) {
      this.isScrolled = true;
      this.isLoading = true;
      await this.loadData();
    }
  };

  sort(id = this.sorted.id, order = this.sorted.order) {
    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      this.sortOnServer(id, order);
    }
  }

  async loadData(range = this.range) {
    this.showLoading();

    const query = new URL(this.url, BACKEND_URL);
    query.searchParams.set("_sort", this.sorted.id);
    query.searchParams.set("_order", this.sorted.order);
    query.searchParams.set("_embed", "subcategory.category");
    query.searchParams.set("_start", this.data.length);
    query.searchParams.set("_end", Number(this.data.length + this.LOAD_COUNT));
    if (range.from) {
      query.searchParams.set("from", range.from.toISOString());
    }
    if (range.to) {
      query.searchParams.set("to", range.to.toISOString());
    }

    let data = [];
    try {
      data = await fetchJson(query);
      if (data) {
        if (!this.isScrolled) {
          this.data = [];
        }
        this.data.push(...data);
        this.update();
        return data;
      }
    } catch (error) {
      throw `Error of data loading. ${error.message}`;
    }
  }

  async sortOnServer(id = this.sorted.id, order = this.sorted.order) {
    this.sorted.order = order;
    this.sorted.id = id;

    if (id && this.url) {
      return await this.loadData();
    }
  }

  sortOnClient(id, order) {
    let sortFunc;
    const type = this.headerConfig.filter((item) => item.id === id)[0]
    .sortType;

    switch (type) {
      case "string":
        sortFunc = (a, b) =>
          this.sortFunctionForString(a, b, id, order);
        break;
      case "number":
        sortFunc = (a, b) =>
          this.sortFunctionForNumber(a, b, id, order);
        break;
      default:
        throw new Error("Произошла ошибка при сортировке данных");
    }
    this.data.sort(sortFunc);
    this.update();
  }

  sortFunctionForString(a, b, id, order) {
    return order === "asc"
      ? a[id].localeCompare(b[id].toUpperCase(), ["ru", "en"])
      : b[id]
          .toUpperCase()
          .localeCompare(a[id].toUpperCase(), ["ru", "en"]);
  }

  sortFunctionForNumber(a, b, id, order) {
    return order === "asc"
      ? a[id] - b[id]
      : b[id] - a[id];
  }

  getTemplate() {
    return `<div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          ${this.createHeaderTemplate()}
          ${this.createBodyTemplate()}
          ${this.createLoaderTemplate()}
          ${this.createPlaceHolderTemplate()}
        </div>
      </div>`;
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

  createBodyTemplate() {
    return `
    <div data-element="body" class="sortable-table__body">
      ${this.createBodyInTemplate()}
    </div>`;
  }

  createBodyInTemplate() {
    return this.isDataLoaded()
      ? this.data.map((item) => this.createRowTemplate(item)).join("")
      : "";
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

  createArrowElement(id) {
    return this.sorted.id === id
      ? `<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>`
      : "";
  }

  update() {
    this.hideLoading();
    if (this.isDataLoaded()) {
      this.hidePlaceholder();
      this.subElements.body.innerHTML = this.createBodyInTemplate();
      this.subElements.header.innerHTML = this.createHeaderDataTemplate();
    } else {
      this.showPlaceholder();
    }
  }

  hasConfig() {
    return this.headerConfig && this.headerConfig.length > 0;
  }

  isDataLoaded() {
    if (this.data && this.data.length > 0) {
      return this.data;
    }
    return false;
  }

  showPlaceholder() {
    this.subElements.emptyPlaceholder.classList.remove(
      "sortable-table__empty-placeholder"
    );
  }

  hidePlaceholder() {
    this.subElements.emptyPlaceholder.classList.add(
      "sortable-table__empty-placeholder"
    );
  }

  showLoading() {
    this.isLoading = true;
  }

  hideLoading() {
    this.isLoading = false;
  }

  destroy() {
    this.controller.abort();
    this.remove();
    this.element = null;
  }
}

