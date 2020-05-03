import { Level, Toast } from "./toast.js";

export const Position = Object.freeze({
  TOPRIGHT: "toaster toaster-top-right",
  BOTTOMRIGHT: "toaster toaster-bottom-right",
  TOPLEFT: "toaster toaster-top-left",
  BOTTOMLEFT: "toaster toaster-bottom-left"
});

export class Toaster {
  constructor(timeout, position) {
    this.timeout = timeout;
    this.toasterDiv = document.createElement("div");
    this.toasterDiv.className = position;
    document.body.appendChild(this.toasterDiv);
  }

  info(text) {
    const toast = new Toast(Level.INFO, text);
    this.toasterDiv.appendChild(toast.getDiv());
    setTimeout(() => {
      toast.deleteDiv();
    }, this.timeout);
  }

  error(text) {
    const toast = new Toast(Level.ERROR, text);
    this.toasterDiv.appendChild(toast.getDiv());
    setTimeout(() => {
      toast.deleteDiv();
    }, this.timeout);
  }

  success(text) {
    const toast = new Toast(Level.SUCCESS, text);
    this.toasterDiv.appendChild(toast.getDiv());
    setTimeout(() => {
      toast.deleteDiv();
    }, this.timeout);
  }
}

export const toaster = new Toaster(1000, Position.TOPRIGHT);
