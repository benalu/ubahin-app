// src/features/fileConversion/lib/validators.ts
import { MAX_FILE_SIZE } from '@/lib/constants/file';
import { UploadedFile } from '../../../types/type';
import { getFileExtension } from './fileUtils';
import { MIME_EXTENSION_MAP } from './fileMimeMap';
import { ErrorCode } from '@/lib/errors/errorMessages';

export interface ValidationResult {
  isValid: boolean;
  errorCode?: ErrorCode;
  errorMessage?: string;
  details?: {
    actualSize?: number;
    maxSize?: number;
    actualType?: string;
    expectedTypes?: string[];
  };
}

// ✅ Main validation function with comprehensive error mapping
export function validateFile(file: File, existingFiles: UploadedFile[]): ValidationResult {
  // ✅ Check for duplicates first
  if (isDuplicate(file, existingFiles)) {
    return {
      isValid: false,
      errorCode: 'DUPLICATE_FILE',
      errorMessage: `File "${file.name}" sudah ditambahkan sebelumnya.`
    };
  }

  // ✅ Check file size
  if (!isFileSizeOk(file)) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
    
    return {
      isValid: false,
      errorCode: 'FILE_TOO_LARGE',
      errorMessage: `File "${file.name}" berukuran ${sizeMB}MB, maksimal ${maxSizeMB}MB.`,
      details: {
        actualSize: file.size,
        maxSize: MAX_FILE_SIZE
      }
    };
  }

  // ✅ Check MIME type and extension match
  const mimeValidation = validateMimeAndExtension(file);
  if (!mimeValidation.isValid) {
    return mimeValidation;
  }

  // ✅ All validations passed
  return { isValid: true };
}

// ✅ Enhanced MIME type validation with detailed error info
export function validateMimeAndExtension(file: File): ValidationResult {
  const ext = getFileExtension(file);
  const expectedExts = MIME_EXTENSION_MAP[file.type];
  
  // Check if MIME type is recognized
  if (!expectedExts || expectedExts.length === 0) {
    return {
      isValid: false,
      errorCode: 'INVALID_MIME_TYPE',
      errorMessage: `File "${file.name}" memiliki tipe MIME yang tidak dikenali (${file.type}).`,
      details: {
        actualType: file.type
      }
    };
  }
  
  // Check if extension matches MIME type
  if (!expectedExts.includes(ext)) {
    return {
      isValid: false,
      errorCode: 'INVALID_MIME_TYPE',
      errorMessage: `File "${file.name}" memiliki ekstensi .${ext} yang tidak cocok dengan tipe file ${file.type}.`,
      details: {
        actualType: file.type,
        expectedTypes: expectedExts
      }
    };
  }

  return { isValid: true };
}

// ✅ Individual validation functions (kept for compatibility)
export function isMimeAndExtensionMatch(file: File): boolean {
  return validateMimeAndExtension(file).isValid;
}

export function isDuplicate(file: File, existingFiles: UploadedFile[]): boolean {
  return existingFiles.some((f) => f.file.name === file.name && f.file.size === file.size);
}

export function isFileSizeOk(file: File): boolean {
  return file.size > 0 && file.size <= MAX_FILE_SIZE;
}

// ✅ Batch validation function for multiple files
export function validateFiles(
  files: File[], 
  existingFiles: UploadedFile[] = []
): {
  valid: File[];
  invalid: { file: File; validation: ValidationResult }[];
  summary: {
    total: number;
    valid: number;
    duplicates: number;
    tooLarge: number;
    invalidMime: number;
    other: number;
  };
} {
  const valid: File[] = [];
  const invalid: { file: File; validation: ValidationResult }[] = [];
  
  const summary = {
    total: files.length,
    valid: 0,
    duplicates: 0,
    tooLarge: 0,
    invalidMime: 0,
    other: 0,
  };

  files.forEach(file => {
    const validation = validateFile(file, existingFiles);
    
    if (validation.isValid) {
      valid.push(file);
      summary.valid++;
    } else {
      invalid.push({ file, validation });
      
      // Categorize errors for summary
      switch (validation.errorCode) {
        case 'DUPLICATE_FILE':
          summary.duplicates++;
          break;
        case 'FILE_TOO_LARGE':
          summary.tooLarge++;
          break;
        case 'INVALID_MIME_TYPE':
          summary.invalidMime++;
          break;
        default:
          summary.other++;
      }
    }
  });

  return { valid, invalid, summary };
}

// ✅ Utility function to check if a file type is allowed
export function isFileTypeAllowed(mimeType: string): boolean {
  return mimeType in MIME_EXTENSION_MAP;
}

// ✅ Get human-readable file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ✅ Type guard for validation results
export function isValidationError(result: ValidationResult): result is ValidationResult & { isValid: false; errorCode: ErrorCode } {
  return !result.isValid && !!result.errorCode;
}