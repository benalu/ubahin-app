// src/lib/constants/file.ts
import { FILE_CATEGORIES } from '@/utils/fileCategories';

// Maksimum ukuran file: 10 MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Ekstensi file yang diperbolehkan (unik)
export const ALLOWED_EXTENSIONS = Object.values(FILE_CATEGORIES)
  .flatMap((cat) => cat.exts)
  .filter((ext, i, arr) => arr.indexOf(ext) === i);

// Format output yang diperbolehkan
export const ALLOWED_OUTPUT_FORMATS = Object.values(FILE_CATEGORIES)
  .flatMap((cat) => cat.outputFormats)
  .filter((ext, i, arr) => arr.indexOf(ext) === i);

export const ALLOWED_MIME_TYPES = Object.values(FILE_CATEGORIES)
  .flatMap((cat) => cat.mimeTypes)
  .filter((mime, i, arr) => arr.indexOf(mime) === i);

export type FileCategoryKey = keyof typeof FILE_CATEGORIES;

// ===== Helpers generic untuk subset kategori (DRY)
export function extsForCategories(...cats: FileCategoryKey[]): string[] {
  const set = new Set<string>();
  for (const c of cats) {
    FILE_CATEGORIES[c]?.exts.forEach((e) => set.add(e));
  }
  return [...set];
}

export function mimesForCategories(...cats: FileCategoryKey[]): string[] {
  const set = new Set<string>();
  for (const c of cats) {
    FILE_CATEGORIES[c]?.mimeTypes.forEach((m) => set.add(m));
  }
  return [...set];
}

export function acceptStringFromExts(exts: readonly string[]): string {
  return exts.map((e) => `.${e}`).join(',');
}

export function hasAllowedExtension(name: string, allowedExts: readonly string[]): boolean {
  const ext = (name.split('.').pop() || '').toLowerCase();
  return allowedExts.includes(ext);
}