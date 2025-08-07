// src/lib/errors/errorMessages.ts

export interface ErrorMessage {
  title: string;
  message: string;
  action?: string;
}

// ✅ Define specific context types instead of any
export interface ErrorContext {
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  operation?: 'upload' | 'convert' | 'download' | 'validate';
  statusCode?: number;
  retryCount?: number;
}

export const ERROR_MESSAGES = {
  // File Conversion Errors
  CONVERSION_FAILED: {
    title: 'Konversi Gagal',
    message: 'File tidak dapat dikonversi. Silakan coba lagi atau gunakan file yang berbeda.',
    action: 'Coba Lagi'
  },
  UPLOAD_FAILED: {
    title: 'Upload Gagal',
    message: 'Gagal mengunggah file ke server. Periksa koneksi internet Anda.',
    action: 'Coba Lagi'
  },
  CLOUDCONVERT_ERROR: {
    title: 'Layanan Tidak Tersedia',
    message: 'Layanan konversi sedang mengalami gangguan. Silakan coba beberapa saat lagi.',
    action: 'Coba Lagi'
  },
  NETWORK_ERROR: {
    title: 'Koneksi Bermasalah',
    message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
    action: 'Periksa Koneksi'
  },
  TIMEOUT_ERROR: {
    title: 'Waktu Habis',
    message: 'Proses konversi memakan waktu terlalu lama. File mungkin terlalu besar atau format tidak didukung.',
    action: 'Coba File Lain'
  },
  
  // File Validation Errors
  UNSUPPORTED_FORMAT: {
    title: 'Format Tidak Didukung',
    message: 'Format file ini belum didukung. Silakan pilih format yang tersedia.',
    action: 'Lihat Format'
  },
  FILE_TOO_LARGE: {
    title: 'File Terlalu Besar',
    message: 'Ukuran file maksimal adalah 10MB. Silakan kompres atau pilih file yang lebih kecil.',
    action: 'Pilih File Lain'
  },
  INVALID_MIME_TYPE: {
    title: 'File Tidak Valid',
    message: 'File ini mungkin rusak atau memiliki ekstensi yang salah.',
    action: 'Periksa File'
  },
  DUPLICATE_FILE: {
    title: 'File Duplikat',
    message: 'File dengan nama yang sama sudah ditambahkan.',
    action: 'Ganti Nama'
  },
  
  // HTTP Status Errors
  BAD_REQUEST: {
    title: 'Permintaan Tidak Valid',
    message: 'Data yang dikirim tidak valid. Silakan periksa file dan coba lagi.',
    action: 'Periksa File'
  },
  UNAUTHORIZED: {
    title: 'Akses Ditolak',
    message: 'Anda tidak memiliki izin untuk melakukan operasi ini.',
    action: 'Login Ulang'
  },
  FORBIDDEN: {
    title: 'Akses Dilarang',
    message: 'Operasi ini tidak diizinkan untuk akun Anda.',
    action: 'Hubungi Support'
  },
  NOT_FOUND: {
    title: 'File Tidak Ditemukan',
    message: 'File yang diminta tidak dapat ditemukan di server.',
    action: 'Coba Lagi'
  },
  SERVER_ERROR: {
    title: 'Server Bermasalah',
    message: 'Terjadi kesalahan pada server. Tim kami akan segera memperbaikinya.',
    action: 'Coba Lagi'
  }
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;

// ✅ Type-safe error handler utility with specific context type
export function getErrorMessage(
  error: Error | string | ErrorCode, 
  context?: ErrorContext
): ErrorMessage {
  // ✅ Handle ErrorCode strings
  if (typeof error === 'string' && error in ERROR_MESSAGES) {
    const baseMessage = ERROR_MESSAGES[error as ErrorCode];
    return enhanceMessageWithContext(baseMessage, context);
  }
  
  // ✅ Handle Error objects with pattern matching
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    
    // Network-related errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return enhanceMessageWithContext(ERROR_MESSAGES.NETWORK_ERROR, context);
    }
    
    // Timeout errors
    if (errorMessage.includes('timeout') || errorMessage.includes('aborted')) {
      return enhanceMessageWithContext(ERROR_MESSAGES.TIMEOUT_ERROR, context);
    }
    
    // CloudConvert specific errors
    if (errorMessage.includes('cloudconvert')) {
      return enhanceMessageWithContext(ERROR_MESSAGES.CLOUDCONVERT_ERROR, context);
    }
    
    // HTTP status code errors
    if (errorMessage.includes('400') || errorMessage.includes('bad request')) {
      return enhanceMessageWithContext(ERROR_MESSAGES.BAD_REQUEST, context);
    }
    
    if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      return enhanceMessageWithContext(ERROR_MESSAGES.UNAUTHORIZED, context);
    }
    
    if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
      return enhanceMessageWithContext(ERROR_MESSAGES.FORBIDDEN, context);
    }
    
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return enhanceMessageWithContext(ERROR_MESSAGES.NOT_FOUND, context);
    }
    
    if (errorMessage.includes('500') || errorMessage.includes('server error')) {
      return enhanceMessageWithContext(ERROR_MESSAGES.SERVER_ERROR, context);
    }
    
    // ✅ Default fallback with original message (but sanitized)
    return {
      title: 'Terjadi Kesalahan',
      message: sanitizeErrorMessage(error.message) || 'Terjadi kesalahan yang tidak diketahui.',
      action: 'Coba Lagi'
    };
  }
  
  // ✅ Ultimate fallback
  return {
    title: 'Terjadi Kesalahan',
    message: 'Mohon maaf, terjadi kesalahan. Silakan coba lagi.',
    action: 'Coba Lagi'
  };
}

// ✅ Helper function to enhance messages with context
function enhanceMessageWithContext(
  baseMessage: ErrorMessage, 
  context?: ErrorContext
): ErrorMessage {
  if (!context) return baseMessage;

  let enhancedMessage = baseMessage.message;

  // Add file-specific context
  if (context.fileName) {
    enhancedMessage = `File "${context.fileName}": ${enhancedMessage}`;
  }

  // Add file size context for size-related errors
  if (context.fileSize && baseMessage === ERROR_MESSAGES.FILE_TOO_LARGE) {
    const sizeMB = (context.fileSize / (1024 * 1024)).toFixed(1);
    enhancedMessage = `File berukuran ${sizeMB}MB melebihi batas maksimal 10MB. ${baseMessage.message}`;
  }

  // Add retry context
  if (context.retryCount && context.retryCount > 0) {
    enhancedMessage += ` (Percobaan ke-${context.retryCount + 1})`;
  }

  return {
    ...baseMessage,
    message: enhancedMessage
  };
}

// ✅ Sanitize error messages to prevent XSS and make them user-friendly
function sanitizeErrorMessage(message: string): string {
  if (!message || typeof message !== 'string') return '';
  
  // Remove sensitive information patterns
  return message
    .replace(/api[_\-]?key|token|password|secret/gi, '[REDACTED]')
    .replace(/https?:\/\/[^\s]+/gi, '[URL]')
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]')
    .trim()
    .slice(0, 200); // Limit message length
}

// ✅ Utility functions for specific error scenarios
export function createFileError(
  code: ErrorCode, 
  fileName: string, 
  additionalContext?: Omit<ErrorContext, 'fileName'>
): ErrorMessage {
  return getErrorMessage(code, { 
    fileName, 
    ...additionalContext 
  });
}

export function createNetworkError(
  statusCode?: number,
  operation?: ErrorContext['operation']
): ErrorMessage {
  const context: ErrorContext = { operation };
  
  if (statusCode) {
    context.statusCode = statusCode;
    
    // Map status codes to specific error types
    if (statusCode === 400) return getErrorMessage('BAD_REQUEST', context);
    if (statusCode === 401) return getErrorMessage('UNAUTHORIZED', context);
    if (statusCode === 403) return getErrorMessage('FORBIDDEN', context);
    if (statusCode === 404) return getErrorMessage('NOT_FOUND', context);
    if (statusCode >= 500) return getErrorMessage('SERVER_ERROR', context);
  }
  
  return getErrorMessage('NETWORK_ERROR', context);
}

// ✅ Type guard for ErrorCode
export function isErrorCode(code: string): code is ErrorCode {
  return code in ERROR_MESSAGES;
}