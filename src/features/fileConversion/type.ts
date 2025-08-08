// src/features/fileConversion/type.ts

import { LoadingState } from './lib/loadingUtils';

export type UploadedFile = {
  file: File;
  converted: boolean;
  downloadUrl?: string;
  previewUrl?: string;
  outputFormat: string;
  jobId?: string;
  

  // ✅ Enhanced loading state
  loadingState: LoadingState;

  // ✅ Additional metadata
  convertedAt?: Date;
  errorMessage?: string;

};
