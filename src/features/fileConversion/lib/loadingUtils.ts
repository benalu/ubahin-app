// src/features/fileConversion/lib/loadingUtils.ts

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

// ✅ Create initial loading state
export function createLoadingState(stage: LoadingStage = 'idle'): LoadingState {
  const stageConfig = LOADING_STAGES[stage];
  return {
    stage,
    progress: stageConfig.progress,
    message: stageConfig.message,
    isLoading: stage !== 'idle' && stage !== 'completed' && stage !== 'error',
  };
}

// ✅ Update loading state with optional custom message
export function updateLoadingState(
  currentState: LoadingState, 
  stage: LoadingStage, 
  customMessage?: string
): LoadingState {
  const stageConfig = LOADING_STAGES[stage];
  return {
    stage,
    progress: stageConfig.progress,
    message: customMessage || stageConfig.message,
    isLoading: stage !== 'idle' && stage !== 'completed' && stage !== 'error',
  };
}

// ✅ Check if loading state indicates an active process
export function isActiveLoading(loadingState: LoadingState): boolean {
  return loadingState.isLoading;
}

// ✅ Check if loading state indicates completion
export function isCompleted(loadingState: LoadingState): boolean {
  return loadingState.stage === 'completed';
}

// ✅ Check if loading state indicates an error
export function hasError(loadingState: LoadingState): boolean {
  return loadingState.stage === 'error';
}

// ✅ Get loading state color for UI
export function getLoadingStateColor(loadingState: LoadingState): string {
  switch (loadingState.stage) {
    case 'idle':
      return 'text-muted-foreground';
    case 'uploading':
    case 'processing':
    case 'converting':
    case 'finishing':
      return 'text-secondary';
    case 'completed':
      return 'text-emerald-600';
    case 'error':
      return 'text-red-500';
    default:
      return 'text-muted-foreground';
  }
}

// ✅ Get progress bar color
export function getProgressBarColor(loadingState: LoadingState): string {
  switch (loadingState.stage) {
    case 'completed':
      return 'bg-emerald-100';
    case 'error':
      return 'bg-red-100';
    default:
      return 'bg-secondary/20';
  }
}