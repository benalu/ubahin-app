// src/features/fileConversion/lib/validators.ts
import { MAX_FILE_SIZE } from '@/lib/constants/file';
import { UploadedFile } from '../type';
import { getFileExtension } from './fileUtils';
import { MIME_EXTENSION_MAP } from './fileMimeMap';

export function isMimeAndExtensionMatch(file: File): boolean {
  const ext = getFileExtension(file);
  const expectedExts = MIME_EXTENSION_MAP[file.type];
  return expectedExts?.includes(ext) ?? false;
}

export function isDuplicate(file: File, existingFiles: UploadedFile[]): boolean {
  return existingFiles.some((f) => f.file.name === file.name);
}

export function isFileSizeOk(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}
