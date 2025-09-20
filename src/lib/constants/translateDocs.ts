// src/lib/constants/translateDocs.ts
import {
  extsForCategories,
  mimesForCategories,
  acceptStringFromExts,
  hasAllowedExtension,
  type FileCategoryKey,
} from "@/lib/constants/file";

// Kategori yang DIDUKUNG DeepL Document API
export const DEEPL_DOC_CATEGORIES = [
  "document",
  "presentation",
  "spreadsheet",
  "web",
  "localization",
  "subtitle",
] as const;

export type DeepLDocCategory = typeof DEEPL_DOC_CATEGORIES[number];

export const DEEPL_DOC_EXTS = extsForCategories(...(DEEPL_DOC_CATEGORIES as readonly FileCategoryKey[]));
export const DEEPL_DOC_MIMES = [
  ...mimesForCategories(...(DEEPL_DOC_CATEGORIES as readonly FileCategoryKey[])),
  "application/octet-stream", // fallback umum dari browser/OS
];

export const DEEPL_DOC_ACCEPT = acceptStringFromExts(DEEPL_DOC_EXTS);

export function isDeepLDocName(fileName: string): boolean {
  return hasAllowedExtension(fileName, DEEPL_DOC_EXTS);
}
