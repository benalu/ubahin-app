// src/lib/allowedExtensions.ts 

import { FILE_CATEGORIES } from '@/features/fileConversion/lib/fileCategories';

export const ALLOWED_EXTENSIONS = Object.values(FILE_CATEGORIES)
  .flatMap((cat) => cat.exts)
  .filter((ext, i, arr) => arr.indexOf(ext) === i); // remove duplicates
