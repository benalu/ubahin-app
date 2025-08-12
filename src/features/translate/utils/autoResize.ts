// src/features/translate/utils/autoResize.ts
export function autoResize(
  el: HTMLTextAreaElement,
  opts: { maxHeight?: number; minHeight?: number } = {}
) {
  if (!el) return;
  const { maxHeight = 400, minHeight = 0 } = opts;

  // reset dulu supaya scrollHeight akurat
  el.style.height = "auto";

  // hitung tinggi baru di-clamp antara min & max
  const next = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
  el.style.height = `${next}px`;

  // kalau melebihi max, munculkan scrollbar vertikal
  el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
}
