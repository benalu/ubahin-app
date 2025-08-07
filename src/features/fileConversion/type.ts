// src/features/fileConversion/type.ts
export type UploadedFile = {
  file: File;
  converted: boolean;
  downloadUrl?: string;
  outputFormat: string;
  jobId?: string;
  isConverting?: boolean;
};