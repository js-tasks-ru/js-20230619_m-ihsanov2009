import BaseClass from "../../baseClass/index.js";

export default class NotificationMessage extends BaseClass {
  static activeNotificationElement = null;

  constructor(message = "", { duration = 0, type = "" } = {}) {
    super();
    this.message = message;
    this._duration = duration;
    this.type = type;
    this.render();
  }

  get element() {
    return this.element;
  }

  get duration() {
    return this._duration;
  }

  getTemplate() {
    return `
      <div class="notification ${this.type}" style="--value:${
      this._duration / 1000
    }s">
        <div class="timer"></div>
        <div class="inner-wrapper">
         <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }

  show(container) {
    const containerElement = container ? container : document.body;
    if (NotificationMessage.activeNotificationElement) {
      NotificationMessage.activeNotificationElement.remove();
    }
    containerElement.append(this.element);

    NotificationMessage.activeNotification = this;

    setTimeout(() => {
      this.remove();
      NotificationMessage.activeNotificationElement = null;
    }, this._duration);
  }
}
