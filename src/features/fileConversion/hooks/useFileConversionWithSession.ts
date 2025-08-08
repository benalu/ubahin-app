// File: src/features/fileConversion/hooks/useFileConversionWithSession.ts
// Enhanced version dari hook yang sudah ada

'use client';

import { DragEvent, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { handleFileSelect } from '../lib/handleFileSelect';
import { convertFileToCloudConvert } from '../lib/apiUtils';
import { getFileCategory } from '../lib/fileUtils';
import { getErrorMessage } from '@/lib/errors/errorMessages';
import { updateLoadingState } from '../lib/loadingUtils';
import { useSessionFileStorage } from './useSessionFileStorage';
import type { UploadedFile } from '../type';

export function useFileConversionWithSession() {
  const {
    files,
    setFiles,
    isRestoring,
    addFiles,
    removeFile,
    clearAllFiles,
    updateFile,
    hasSessionData,
  } = useSessionFileStorage();
  
  // Check if all files are in the same CATEGORY
  const getFileCategories = () => files.map(f => getFileCategory(f.file));
  const allSameCategory = files.length > 0 && getFileCategories().every(category => category === getFileCategories()[0]);
  const canDownload = files.length > 0 && files.every((f) => f.converted);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = handleFileSelect(droppedFiles, files);
    
    if (validFiles.length > 0) {
      const newFileObjects = validFiles.map(vf => vf.file);
      addFiles(newFileObjects);
    }
  }

  function handleManualSelect(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    const validFiles = handleFileSelect(selectedFiles, files);
    
    if (validFiles.length > 0) {
      const newFileObjects = validFiles.map(vf => vf.file);
      addFiles(newFileObjects);
    }
    
    e.target.value = '';
  }

  function handleRemoveFile(index: number) {
    removeFile(index);
  }

  async function handleConvert(item: UploadedFile, index: number) {
    try {
      updateFile(index, {
        loadingState: updateLoadingState(item.loadingState, 'uploading'),
        errorMessage: undefined
      });

      const data = await convertFileToCloudConvert(item);

      updateFile(index, {
        loadingState: updateLoadingState(item.loadingState, 'processing')
      });

      setTimeout(() => {
        updateFile(index, {
          loadingState: updateLoadingState(item.loadingState, 'converting')
        });
      }, 400);

      setTimeout(() => {
        updateFile(index, {
          loadingState: updateLoadingState(item.loadingState, 'finishing')
        });
      }, 600);

      setTimeout(() => {
        updateFile(index, {
          jobId: data.jobId,
          downloadUrl: data.downloadUrl || '',
          converted: !!data.downloadUrl,
          convertedAt: new Date(),
          loadingState: data.downloadUrl 
            ? updateLoadingState(item.loadingState, 'completed', 'Konversi berhasil!')
            : updateLoadingState(item.loadingState, 'error', 'Tidak ada URL download'),
        });
      }, 800);

    } catch (error) {
      console.error('Conversion error:', error);
      
      const errorMessage = getErrorMessage(error instanceof Error ? error : 'CONVERSION_FAILED', {
        fileName: item.file.name,
        operation: 'convert'
      });

      updateFile(index, {
        loadingState: updateLoadingState(item.loadingState, 'error', errorMessage.message),
        errorMessage: errorMessage.message
      });

      toast.error(errorMessage.title, {
        description: errorMessage.message,
        action: errorMessage.action ? {
          label: errorMessage.action,
          onClick: () => handleConvert(item, index),
        } : undefined,
        duration: 5000,
      });
    }
  }

  async function handleConvertAll() {
    const filesToConvert = files.filter(f => !f.converted && !f.loadingState.isLoading);
    
    if (filesToConvert.length === 0) {
      toast.warning('Tidak ada file yang perlu dikonversi');
      return;
    }

    const promises = filesToConvert.map(async (file, arrayIndex) => {
      const actualIndex = files.findIndex(f => f.file.name === file.file.name);
      if (actualIndex !== -1) {
        await handleConvert(file, actualIndex);
      }
    });

    toast.info(`Memulai konversi ${filesToConvert.length} file...`);
    await Promise.allSettled(promises);
  }

  function resetFiles() {
    const processingFiles = files.filter(f => f.loadingState.isLoading);
    if (processingFiles.length > 0) {
      const proceed = window.confirm(
        `${processingFiles.length} file sedang diproses. Yakin ingin menghapus semua file?`
      );
      if (!proceed) return;
    }

    clearAllFiles();
    toast.info('Semua file telah dihapus');
  }

  function handleSetAllFormats(format: string) {
    setFiles(prevFiles =>
      prevFiles.map(f => ({
        ...f,
        outputFormat: format
      }))
    );
    
    toast.success(`Semua file diset ke format .${format.toUpperCase()}`);
  }

  return {
    files,
    canDownload,
    setFiles,
    allSameCategory,
    isRestoring,
    hasSessionData,
    handleDrop,
    handleManualSelect,
    handleRemoveFile,
    handleConvert,
    handleConvertAll,
    resetFiles,
    handleSetAllFormats,
  };
}