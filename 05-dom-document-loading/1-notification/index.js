export default class NotificationMessage {
  static activeNotificationElement = null;
  _element = null;

  constructor(message = "", { duration = 0, type = "" } = {}) {
    this._message = message;
    this._duration = duration;
    this._type = type;
    this._render();
  }

  get element() {
    return this._element;
  }

  get duration() {
    return this._duration;
  }

  _createTemplate() {
    return `
      <div class="notification ${this._type}" style="--value:${
      this._duration / 1000
    }s">
        <div class="timer"></div>
        <div class="inner-wrapper">
         <div class="notification-header">${this._type}</div>
          <div class="notification-body">
            ${this._message}
          </div>
        </div>
      </div>
    `;
  }

  _render() {
    const divElement = document.createElement("div");
    divElement.innerHTML = this._createTemplate();
    this._element = divElement.firstElementChild;
  }

  show(container) {
    const containerElement = container ? container : document.body;
    if (NotificationMessage.activeNotificationElement) {
      NotificationMessage.activeNotificationElement.remove();
    }
    containerElement.append(this._element);

    NotificationMessage.activeNotification = this;

    setTimeout(() => {
      this.remove();
      NotificationMessage.activeNotificationElement = null;
    }, this._duration);
  }

  remove() {
    this._element.remove();
  }

  destroy() {
    this.remove();
  }
}
