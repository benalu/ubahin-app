// src/features/fileConversion/lib/handleFileSelect.ts
import { toast } from 'sonner';
import { getFileExtension, isSupportedFile } from './fileUtils';
import {
  isDuplicate,
  isFileSizeOk,
  isMimeAndExtensionMatch,
} from './validators';
import type { UploadedFile } from '../type';

export function handleFileSelect(
  newFiles: File[],
  existingFiles: UploadedFile[]
): UploadedFile[] {
  const validFiles: UploadedFile[] = [];
  const rejectedFiles: string[] = [];
  const duplicateFiles: string[] = [];

  newFiles.forEach((file) => {
    const isExtSupported = isSupportedFile(file);
    const isSizeOkay = isFileSizeOk(file);
    const isDup = isDuplicate(file, existingFiles);
    const isMimeValid = isMimeAndExtensionMatch(file);

    if (isDup) {
      duplicateFiles.push(file.name);
      return;
    }

    if (!isMimeValid) {
      rejectedFiles.push(`${file.name} (MIME tidak valid: ${file.type})`);
      return;
    }

    if (isExtSupported && isSizeOkay) {
      validFiles.push({
        file,
        converted: false,
        downloadUrl: '',
        outputFormat: getFileExtension(file),
      });
    } else {
      if (!isExtSupported && !isSizeOkay) {
        rejectedFiles.push(`${file.name} (format & size tidak valid)`);
      } else if (!isExtSupported) {
        rejectedFiles.push(`${file.name} (format tidak didukung)`);
      } else if (!isSizeOkay) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        rejectedFiles.push(`${file.name} (${sizeMB} MB > 10 MB)`);
      }
    }
  });

  if (duplicateFiles.length > 0) {
    toast.warning(`Duplikat file:\n${duplicateFiles.join('\n')}`);
  }

  if (rejectedFiles.length > 0) {
    toast.error(`File ditolak:\n${rejectedFiles.join('\n')}`);
  }

  return validFiles;
}
