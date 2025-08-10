// src/features/fileConversion/lib/handleFileSelect.ts
import { toast } from 'sonner';
import { getFileExtension, isSupportedFile } from './fileUtils';
import { validateFile, ValidationResult } from './validators';
import { getErrorMessage, createFileError, ErrorCode } from '@/lib/errors/errorMessages';
import { createLoadingState } from './loadingUtils';
import type { UploadedFile } from '../../../types/type';

export function handleFileSelect(
  newFiles: File[],
  existingFiles: UploadedFile[]
): UploadedFile[] {
  const validFiles: UploadedFile[] = [];
  const errorMessages: string[] = [];

  newFiles.forEach((file) => {
    // ✅ Enhanced validation with specific error messages using our error system
    const validation = validateFile(file, existingFiles);
    
    if (!validation.isValid) {
      const errorMessage = handleValidationError(validation, file);
      errorMessages.push(errorMessage);
      return;
    }

    // ✅ Check if file type is supported
    if (!isSupportedFile(file)) {
      const errorMessage = handleUnsupportedFile(file);
      errorMessages.push(errorMessage);
      return;
    }

    // ✅ File is valid, add to list
    validFiles.push({
      file,
      converted: false,
      downloadUrl: '',
      outputFormat: getFileExtension(file),
      // ✅ Add default loading state
      loadingState: createLoadingState('idle'),
    });
  });

  // ✅ Show error messages using our enhanced system
  if (errorMessages.length > 0) {
    showErrorMessages(errorMessages);
  }

  // ✅ Show success message if files were added
  if (validFiles.length > 0) {
    showSuccessMessage(validFiles);
  }

  return validFiles;
}

// ✅ Helper function to handle validation errors with proper error messages
function handleValidationError(validation: ValidationResult, file: File): string {
  if (!validation.errorCode) {
    return `Error processing ${file.name}`;
  }

  // Map validation error codes to our ErrorMessage system
  const errorCode = validation.errorCode as ErrorCode;
  const errorMessage = createFileError(errorCode, file.name, {
    fileSize: file.size,
    fileType: file.type,
    operation: 'validate'
  });

  return errorMessage.message;
}

// ✅ Helper function to handle unsupported file types
function handleUnsupportedFile(file: File): string {
  const ext = getFileExtension(file);
  const errorMessage = createFileError('UNSUPPORTED_FORMAT', file.name, {
    fileType: `.${ext}`,
    operation: 'validate'
  });

  return `${errorMessage.message} Format: .${ext}`;
}

// ✅ Enhanced error display with categorization
function showErrorMessages(errorMessages: string[]): void {
  if (errorMessages.length === 1) {
    // Single error - show as regular toast
    toast.error(errorMessages[0], {
      duration: 4000,
      closeButton: true,
    });
  } else {
    // Multiple errors - show summary with expandable details
    const summaryMessage = `${errorMessages.length} file tidak dapat ditambahkan`;
    
    toast.error(summaryMessage, {
      duration: 6000,
      closeButton: true,
      description: errorMessages.slice(0, 2).join('\n') + 
        (errorMessages.length > 2 ? `\n... dan ${errorMessages.length - 2} error lainnya` : ''),
    });

    // Optionally log all errors to console for debugging
    console.group('File Selection Errors:');
    errorMessages.forEach((error, index) => {
      console.warn(`${index + 1}. ${error}`);
    });
    console.groupEnd();
  }
}

// ✅ Enhanced success message
function showSuccessMessage(validFiles: UploadedFile[]): void {
  const count = validFiles.length;
  const message = count === 1 
    ? `File "${validFiles[0].file.name}" berhasil ditambahkan`
    : `${count} file berhasil ditambahkan`;
  
  toast.success(message, {
    duration: 2000,
    description: count > 1 ? 'Siap untuk dikonversi' : undefined,
  });
}

// ✅ Enhanced version with batch processing result summary
export function handleFileSelectWithSummary(
  newFiles: File[],
  existingFiles: UploadedFile[]
): {
  validFiles: UploadedFile[];
  summary: {
    total: number;
    added: number;
    rejected: number;
    duplicates: number;
    errors: string[];
  };
} {
  const validFiles: UploadedFile[] = [];
  const errors: string[] = [];
  const duplicates: string[] = [];

  newFiles.forEach((file) => {
    const validation = validateFile(file, existingFiles);
    
    if (!validation.isValid) {
      if (validation.errorCode === 'DUPLICATE_FILE') {
        duplicates.push(file.name);
      } else {
        const errorMessage = handleValidationError(validation, file);
        errors.push(errorMessage);
      }
      return;
    }

    if (!isSupportedFile(file)) {
      const errorMessage = handleUnsupportedFile(file);
      errors.push(errorMessage);
      return;
    }

    validFiles.push({
      file,
      converted: false,
      downloadUrl: '',
      outputFormat: getFileExtension(file),
      loadingState: {
        stage: 'idle',
        progress: 0,
        message: 'Siap untuk konversi',
        isLoading: false,
      },
    });
  });

  // Show messages based on results
  if (errors.length > 0) {
    showErrorMessages(errors);
  }
  
  if (duplicates.length > 0) {
    const duplicateMessage = duplicates.length === 1
      ? `File "${duplicates[0]}" sudah ditambahkan sebelumnya`
      : `${duplicates.length} file duplikat diabaikan`;
    
    toast.warning(duplicateMessage, {
      duration: 3000,
      description: duplicates.length > 1 ? duplicates.slice(0, 3).join(', ') + '...' : undefined,
    });
  }

  if (validFiles.length > 0) {
    showSuccessMessage(validFiles);
  }

  return {
    validFiles,
    summary: {
      total: newFiles.length,
      added: validFiles.length,
      rejected: errors.length,
      duplicates: duplicates.length,
      errors,
    },
  };
}