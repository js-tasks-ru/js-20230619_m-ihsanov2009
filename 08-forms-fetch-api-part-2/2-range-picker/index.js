import BaseClass from "../../baseClass/index.js";

export default class RangePicker extends BaseClass {
  tempSelection = [];
  locale = "ru";
  subElements = {};

  constructor({ from = new Date(), to = new Date() } = {}) {
    super();
    this.startDate = new Date(from);
    this.selected = { from, to };
    this.initialize();
  }

  initialize() {
    this.render();
    this.createSubElements();
    this.insertPickedDates();
    this.createListeners();
  }

  createListeners() {
    this.subElements.input.addEventListener("click", this.onToggle);
    this.subElements.selector.addEventListener("click", this.handleSelection);
    document.addEventListener("click", this.onDocumentClick, true);
  }

  getTemplate() {
    return `
      <div class="rangepicker">
        <div class="rangepicker__input" data-element="input">
            <span data-element="from"></span> -
            <span data-element="to"></span>
        </div>
        <div class="rangepicker__selector" data-element="selector"></div>
      </div>`;
  }

  handleSelection = (event) => {
    if (event.target.closest(".rangepicker__cell")) {
      this.tempSelection.push(event.target.dataset.value);
      if (this.tempSelection.length === 2) {
        this.executeRangeSelection();
      } else {
        this.renderHighlight();
      }
    }
  };

  executeRangeSelection() {
    this.tempSelection.sort((a, b) => Date.parse(a) - Date.parse(b));
    this.selected.from = new Date(this.tempSelection[0]);
    this.selected.to = new Date(this.tempSelection[1]);
    this.tempSelection = [];
    this.insertPickedDates();
    this.renderHighlight();
    this.onToggle();
  }

  dispatchEvent() {
    this.element.dispatchEvent(
      new CustomEvent("date-select", {
        bubbles: true,
        detail: this.selected,
      })
    );
  }

  insertPickedDates() {
    this.subElements.from.innerHTML = this.getFormattedDate(this.selected.from);
    this.subElements.to.innerHTML = this.getFormattedDate(this.selected.to);
  }

  getFormattedDate(date) {
    return new Intl.DateTimeFormat(this.locale, { dateStyle: "short" }).format(
      new Date(date)
    );
  }

  onToggle = () => {
    this.element.classList.toggle("rangepicker_open");
    if (this.element.classList.contains("rangepicker_open")) {
      this.renderRangePicker();
    }
  };

  onDocumentClick = (event) => {
    if (
      this.element.classList.contains("rangepicker_open") &&
      !this.element.contains(event.target)
    ) {
      this.onToggle();
    }
  };

  prevMonth = () => {
    this.startDate.setMonth(this.startDate.getMonth() - 1);
    this.renderRangePicker();
  };

  nextMonth = () => {
    this.startDate.setMonth(this.startDate.getMonth() + 1);
    this.renderRangePicker();
  };

  getMonthName(date) {
    return new Intl.DateTimeFormat(this.locale, { month: "long" }).format(
      new Date(date)
    );
  }

  renderRangePicker() {
    const dateLeft = new Date(this.startDate);
    const dateRight = new Date(this.startDate);
    dateRight.setMonth(dateRight.getMonth() + 1);

    this.subElements.selector.innerHTML = `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.generateRangePickerCalendar(dateLeft)}
      ${this.generateRangePickerCalendar(dateRight)}`;

    this.renderHighlight();

    const arrowLeft = this.subElements.selector.querySelector(
      ".rangepicker__selector-control-left"
    );
    arrowLeft.addEventListener("click", this.prevMonth);

    const arrowRight = this.subElements.selector.querySelector(
      ".rangepicker__selector-control-right"
    );
    arrowRight.addEventListener("click", this.nextMonth);
  }

  getFirstDayOffset(date) {
    const dayIndex = date.getDay();
    const index = dayIndex === 0 ? 6 : dayIndex - 1;
    return index + 1;
  }

  renderOneDay(date, index) {
    const currentDate = new Date(date);
    currentDate.setDate(index + 1);
    const isoValue = currentDate.toISOString();

    const style =
      index === 0
        ? `style="--start-from: ${this.getFirstDayOffset(currentDate)}"`
        : "";
    return `<button type="button" class="rangepicker__cell" data-value="${isoValue}" ${style}>${
      index + 1
    }</button>`;
  }

  getDaysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  renderDays(date) {
    const monthDays = new Array(this.getDaysInMonth(date))
      .fill("_")
      .map((_, index) => {
        return this.renderOneDay(date, index);
      });
    return monthDays.join("");
  }

  generateRangePickerCalendar(date) {
    return `
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime=${this.getMonthName(
            date,
            this.locale
          )}>${this.getMonthName(date)}</time>
        </div>
        <div class="rangepicker__day-of-week">
          ${this.renderWeekDays()}
        </div>
        <div class="rangepicker__date-grid">
          ${this.renderDays(date)}
        </div>
      </div>`;
  }

  renderHighlight() {
    this.subElements.selector
      .querySelectorAll(".rangepicker__cell")
      .forEach((element) => {
        const isoValue = element.dataset.value;

        element.classList.value = "";
        const fromDate = this.tempSelection.length
          ? new Date(this.tempSelection[0])
          : this.selected.from;
        const toDate = this.tempSelection.length ? null : this.selected.to;

        const fromISO = fromDate.toISOString();
        let toISO = toDate?.toISOString();

        element.classList.add("rangepicker__cell");

        if (fromISO && isoValue === fromISO) {
          element.classList.add("rangepicker__selected-from");
        } else if (toISO && isoValue === toISO) {
          element.classList.add("rangepicker__selected-to");
        } else if (fromISO && isoValue > fromISO && toISO && isoValue < toISO) {
          element.classList.add("rangepicker__selected-between");
        }
      });
  }

  renderWeekDays() {
    const baseDate = new Date(Date.UTC(2017, 0, 2));
    const format = new Intl.DateTimeFormat(this.locale, { weekday: "short" })
      .format;

    return new Array(7)
      .fill("_")
      .map(() => {
        const weekDay = format(baseDate);
        baseDate.setDate(baseDate.getDate() + 1);
        return `<div>${weekDay}</div>`;
      })
      .join("");
  }

  destroyListeners() {
    document.removeEventListener("click", this.onDocumentClick, true);
  }
}
