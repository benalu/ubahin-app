// src/utils/languageSorting.ts


import { useMemo } from "react";

export type SortableItem = { code: string; label: string };

function normalizeForSorting(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[()]/g, "")
    .trim();
}

export function sortLanguagesByName(items: SortableItem[]): SortableItem[] {
  return [...items].sort((a, b) =>
    normalizeForSorting(a.label).localeCompare(normalizeForSorting(b.label), ["id-ID", "en-US"], {
      numeric: true,
      sensitivity: "base",
      ignorePunctuation: true,
    })
  );
}

function reorderForVerticalLayout(items: SortableItem[], columns: number): SortableItem[] {
  if (columns <= 1 || items.length <= columns) return items;
  const total = items.length;
  const rows = Math.ceil(total / columns);
  const out: SortableItem[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const idx = c * rows + r;
      if (idx < total) out.push(items[idx]);
    }
  }
  return out;
}

export function useSortedLanguages(items: SortableItem[]): SortableItem[] {
  return useMemo(() => {
    if (!items?.length) return [];
    const pinned = items.filter((i) => i.code === "auto");
    const others = items.filter((i) => i.code !== "auto");
    const sorted = sortLanguagesByName(others);
    const combined = [...pinned, ...sorted];

    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    if (isMobile) return combined;

    const { columns } = getColumnLayout(combined.length, false);
    const cols = Math.min(columns, 3);
    return reorderForVerticalLayout(combined, cols);
  }, [items]);
}

export function getColumnLayout(itemCount: number, isMobile: boolean) {
  if (isMobile) return { columns: 1, className: "grid-cols-1 gap-1" };
  if (itemCount <= 12) return { columns: 2, className: "grid-cols-2 gap-x-4 gap-y-1 relative" };
  return { columns: 3, className: "grid-cols-3 gap-x-4 gap-y-1 relative" };
}
