// src/features/fileConversion/hooks/useFileConversionWithGlobalSession.ts
// Enhanced hook yang update global session state

'use client';

import { useEffect } from 'react';
import { useFileConversionWithSession } from './useFileConversionWithSession';
import { updateGlobalSession } from '@/hooks/useGlobalSession';

export function useFileConversionWithGlobalSession() {
  const fileConversionData = useFileConversionWithSession();
  const { files, isRestoring } = fileConversionData;

  // Update global session state whenever files change
  useEffect(() => {
    const sessionState = {
      fileCount: files.length,
      isRestoring,
      convertedCount: files.filter(f => f.converted).length,
      processingCount: files.filter(f => f.loadingState?.isLoading).length,
      files,
    };

    updateGlobalSession(sessionState);
  }, [files, isRestoring]);

  // Cleanup when unmount
 // useEffect(() => {
   // return () => {
    //  updateGlobalSession({
     //   fileCount: 0,
      //  isRestoring: false,
      //  convertedCount: 0,
      //  processingCount: 0,
     // });
   // };
 // }, []);

  return fileConversionData;
}