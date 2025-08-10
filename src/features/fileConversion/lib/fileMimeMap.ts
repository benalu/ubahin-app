// src/features/fileConversion/lib/fileMimeMap.ts

import { FILE_CATEGORIES } from '../../../utils/fileCategories';

type MimeExtMap = Record<string, string[]>;

export const MIME_EXTENSION_MAP: MimeExtMap = {};

for (const category of Object.values(FILE_CATEGORIES)) {
  if (category.mimeTypes) {
    category.mimeTypes.forEach((mime) => {
      if (!MIME_EXTENSION_MAP[mime]) {
        MIME_EXTENSION_MAP[mime] = [];
      }
      MIME_EXTENSION_MAP[mime].push(...category.exts);
    });
  }
}
