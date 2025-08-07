// src/features/fileConversion/lib/fileUtils.ts

import { FILE_CATEGORIES } from './fileCategories';

export function getFileExtension(file: File): string {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : '';
  return ext?.toLowerCase() || '';
}

export function isSupportedFile(file: File): boolean {
  const ext = getFileExtension(file);
  if (!ext) return false;
  return Object.values(FILE_CATEGORIES).some((cat) => cat.exts.includes(ext));
}

export function getFileCategory(file: File): keyof typeof FILE_CATEGORIES {
  const ext = getFileExtension(file);
  const keys = Object.keys(FILE_CATEGORIES) as (keyof typeof FILE_CATEGORIES)[];
  for (const key of keys) {
    if (FILE_CATEGORIES[key].exts.includes(ext)) {
      return key;
    }
  }
  return 'document';
}

export function getOutputFormatOptionsByFile(file: File): readonly string[] {
  const category = getFileCategory(file);
  return FILE_CATEGORIES[category].outputFormats;
}

