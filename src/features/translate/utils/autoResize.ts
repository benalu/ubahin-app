export function autoResize(element: HTMLTextAreaElement) {
  element.style.height = "auto";
  element.style.height = Math.min(element.scrollHeight, 400) + "px";
}
