export const Level = Object.freeze({
  INFO: "toast info-toast",
  SUCCESS: "toast success-toast",
  ERROR: "toast error-toast"
});

export class Toast {
  constructor(level, text) {
    this.text = text;
    if (text.length === 0) {
      this.text = "<i>Empty notification</i>";
    }
    this.level = level;
    this.element = document.createElement("div");
    this.element.className = this.level;
    this.element.innerHTML = this.text;
  }

  getDiv() {
    return this.element;
  }

  deleteDiv() {
    this.element.style.opacity = "0";
    this.element.classList.add("toast-fading");
    setTimeout(() => {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }, 1000);
  }
}
