// src/features/fileConversion/lib/generateAcceptString.ts

import { FILE_CATEGORIES } from '../../../utils/fileCategories';

export function generateAcceptString(): string {
  const allExts = Object.values(FILE_CATEGORIES)
    .flatMap((cat) => cat.exts)
    .map((ext) => `.${ext}`);

  // Hapus duplikat
  const uniqueExts = Array.from(new Set(allExts));

  return uniqueExts.join(',');
}