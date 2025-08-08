// src/components/shared/Header/SessionIndicator.tsx

'use client';

import { Database, Clock, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionIndicatorProps {
  fileCount: number;
  isRestoring: boolean;
  convertedCount?: number;
  processingCount?: number;
}

export default function SessionIndicator({ 
  fileCount, 
  isRestoring,
  convertedCount = 0,
  processingCount = 0
}: SessionIndicatorProps) {
  // Don't show if no files
  if (fileCount === 0) return null;

  // Determine indicator state
  const getIndicatorState = () => {
    if (isRestoring) {
      return {
        icon: Database,
        text: `Memulihkan ${fileCount}`,
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10',
        borderColor: 'border-blue-400/20',
      };
    }
    
    if (processingCount > 0) {
      return {
        icon: Loader2,
        text: `${processingCount}/${fileCount}`,
        color: 'text-orange-400',
        bgColor: 'bg-orange-400/10',
        borderColor: 'border-orange-400/20',
        spinning: true,
      };
    }
    
    if (convertedCount === fileCount && fileCount > 0) {
      return {
        icon: CheckCircle,
        text: `${fileCount} siap`,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-400/10',
        borderColor: 'border-emerald-400/20',
      };
    }
    
    return {
      icon: FileText,
      text: `${fileCount} file`,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      borderColor: 'border-secondary/20',
    };
  };

  const state = getIndicatorState();
  const Icon = state.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: 10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.8, x: 10 }}
        className={`
          relative flex items-center gap-2 px-3 py-2 rounded-xl border
          ${state.bgColor} ${state.borderColor} ${state.color}
          backdrop-blur-sm transition-all duration-300 font-medium
          shadow-sm hover:shadow-md font-calSans
        `}
      >
        <Icon 
          className={`w-4 h-4 ${state.spinning ? 'animate-spin' : ''}`} 
        />
        <span className="text-xs font-semibold whitespace-nowrap">
          {state.text}
        </span>
        
        {/* Pulse animation for active states */}
        {(isRestoring || processingCount > 0) && (
          <motion.div
            className={`absolute inset-0 rounded-xl ${state.bgColor} -z-10`}
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.1, 0.3] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}