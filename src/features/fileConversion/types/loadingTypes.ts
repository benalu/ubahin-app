// src/features/fileConversion/types/loadingTypes.ts
export type LoadingStage = 
  | 'idle' 
  | 'uploading' 
  | 'processing' 
  | 'converting' 
  | 'finishing' 
  | 'completed' 
  | 'error';

export interface LoadingState {
  stage: LoadingStage;
  progress: number; // 0-100
  message: string;
  isLoading: boolean;
}

export const LOADING_STAGES = {
  idle: { message: 'Siap untuk konversi', progress: 0 },
  uploading: { message: 'Mengunggah file...', progress: 20 },
  processing: { message: 'Memproses file...', progress: 40 },
  converting: { message: 'Mengkonversi format...', progress: 70 },
  finishing: { message: 'Menyelesaikan...', progress: 90 },
  completed: { message: 'Konversi selesai!', progress: 100 },
  error: { message: 'Terjadi kesalahan', progress: 0 },
} as const;

