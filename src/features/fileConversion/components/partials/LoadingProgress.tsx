// src/features/fileConversion/components/partials/LoadingProgress.tsx

import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingState } from '../../types/loadingTypes';
import { Loader2, CheckCircle, AlertCircle, Upload, Settings, RefreshCw, Sparkles } from 'lucide-react';

interface LoadingProgressProps {
  loadingState: LoadingState;
  fileName: string;
}

export function LoadingProgress({ loadingState, fileName }: LoadingProgressProps) {
  const { stage, progress, message, isLoading } = loadingState;

  if (stage === 'idle') return null;

  // ✅ Get appropriate icon for each stage
  const getStageIcon = () => {
    switch (stage) {
      case 'uploading':
        return <Upload className="w-4 h-4 animate-pulse text-blue-500" />;
      case 'processing':
        return <Settings className="w-4 h-4 animate-spin text-orange-500" />;
      case 'converting':
        return <RefreshCw className="w-4 h-4 animate-spin text-purple-500" />;
      case 'finishing':
        return <Sparkles className="w-4 h-4 animate-pulse text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin text-secondary" />;
    }
  };

  // ✅ Get progress bar styling based on stage
  const getProgressBarStyling = () => {
    switch (stage) {
      case 'error':
        return 'bg-red-100 [&>div]:bg-red-500';
      case 'completed':
        return 'bg-emerald-100 [&>div]:bg-emerald-500';
      case 'uploading':
        return 'bg-blue-100 [&>div]:bg-blue-500';
      case 'processing':
        return 'bg-orange-100 [&>div]:bg-orange-500';
      case 'converting':
        return 'bg-purple-100 [&>div]:bg-purple-500';
      case 'finishing':
        return 'bg-yellow-100 [&>div]:bg-yellow-500';
      default:
        return 'bg-secondary/20 [&>div]:bg-secondary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-3"
    >
      {/* ✅ Main progress bar with icon */}
      <div className="flex items-center gap-3">
        <motion.div
          key={stage}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {getStageIcon()}
        </motion.div>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <motion.span 
              key={message}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs font-medium text-muted-foreground"
            >
              {message}
            </motion.span>
            <motion.span 
              key={progress}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-xs font-bold text-muted-foreground"
            >
              {progress}%
            </motion.span>
          </div>
          
          <Progress 
            value={progress} 
            className={`h-2 transition-all duration-300 ${getProgressBarStyling()}`}
          />
        </div>
      </div>

      {/* ✅ Enhanced stage indicators */}
      <div className="flex justify-between gap-1 px-1">
        {[
          { name: 'uploading', label: 'Upload', progress: 20 },
          { name: 'processing', label: 'Process', progress: 40 },
          { name: 'converting', label: 'Convert', progress: 70 },
          { name: 'finishing', label: 'Finish', progress: 90 }
        ].map((stageInfo) => {
          const isActive = stage === stageInfo.name;
          const isCompleted = progress > stageInfo.progress;
          const isPending = progress < stageInfo.progress;
          
          return (
            <motion.div
              key={stageInfo.name}
              className={`
                flex-1 text-center py-1 px-2 rounded-md text-[10px] font-medium transition-all duration-200
                ${isActive ? 'bg-secondary/20 text-secondary shadow-sm scale-105' :
                  isCompleted ? 'bg-emerald-50 text-emerald-600' :
                  'text-muted-foreground/50 bg-transparent'}
              `}
              initial={false}
              animate={{
                scale: isActive ? 1.05 : 1,
                backgroundColor: isActive ? 'rgba(var(--secondary), 0.2)' : 
                                isCompleted ? 'rgba(34, 197, 94, 0.1)' : 
                                'transparent'
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex flex-col items-center gap-0.5">
                <div className={`
                  w-1.5 h-1.5 rounded-full transition-all duration-200
                  ${isActive ? 'bg-secondary animate-pulse' :
                    isCompleted ? 'bg-emerald-500' :
                    'bg-muted-foreground/30'}
                `} />
                <span>{stageInfo.label}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ✅ Show completion time for completed files */}
      <AnimatePresence>
        {stage === 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-[10px] text-emerald-600 text-center font-medium bg-emerald-50 py-1 px-2 rounded-md"
          >
            ✨ File siap diunduh!
          </motion.div>
        )}
        
        {stage === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-[10px] text-red-600 text-center font-medium bg-red-50 py-1 px-2 rounded-md"
          >
            ❌ Konversi gagal, coba lagi
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}