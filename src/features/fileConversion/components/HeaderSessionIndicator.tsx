// File: src/features/fileConversion/components/HeaderSessionIndicator.tsx

'use client';

import { useEffect, useState } from 'react';
import { Database, Clock, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderSessionIndicatorProps {
  fileCount: number;
  isRestoring: boolean;
  convertedCount?: number;
  processingCount?: number;
}

export function HeaderSessionIndicator({ 
  fileCount, 
  isRestoring,
  convertedCount = 0,
  processingCount = 0
}: HeaderSessionIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Show indicator when there are files
  useEffect(() => {
    setIsVisible(fileCount > 0);
  }, [fileCount]);

  if (!isVisible) return null;

  // Determine indicator state
  const getIndicatorState = () => {
    if (isRestoring) {
      return {
        icon: Database,
        text: `Restoring ${fileCount} files`,
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10',
        borderColor: 'border-blue-400/20',
      };
    }
    
    if (processingCount > 0) {
      return {
        icon: Loader2,
        text: `Converting ${processingCount}/${fileCount}`,
        color: 'text-orange-400',
        bgColor: 'bg-orange-400/10',
        borderColor: 'border-orange-400/20',
        spinning: true,
      };
    }
    
    if (convertedCount === fileCount && fileCount > 0) {
      return {
        icon: CheckCircle,
        text: `${fileCount} files ready`,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-400/10',
        borderColor: 'border-emerald-400/20',
      };
    }
    
    return {
      icon: FileText,
      text: `${fileCount} files`,
      color: 'text-gray-400',
      bgColor: 'bg-gray-400/10',
      borderColor: 'border-gray-400/20',
    };
  };

  const state = getIndicatorState();
  const Icon = state.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full border
          ${state.bgColor} ${state.borderColor} ${state.color}
          backdrop-blur-sm transition-all duration-300
        `}
      >
        <Icon 
          className={`w-4 h-4 ${state.spinning ? 'animate-spin' : ''}`} 
        />
        <span className="text-xs font-medium whitespace-nowrap">
          {state.text}
        </span>
        
        {/* Pulse animation for active states */}
        {(isRestoring || processingCount > 0) && (
          <motion.div
            className={`absolute inset-0 rounded-full ${state.bgColor}`}
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.2, 0.5] 
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