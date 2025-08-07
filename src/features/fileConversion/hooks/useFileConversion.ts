// src/features/fileConversion/hooks/useFileConversion.ts
'use client';

import { useState, DragEvent, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { handleFileSelect } from '../lib/handleFileSelect';
import { convertFileToCloudConvert } from '../lib/apiUtils';
import { getFileCategory } from '../lib/fileUtils';
import { getErrorMessage, createFileError } from '@/lib/errors/errorMessages';
import { createLoadingState, updateLoadingState } from '../lib/loadingUtils';
import type { UploadedFile } from '../type';

export function useFileConversion() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  
  // ✅ Check if all files are in the same CATEGORY (not extension)
  const getFileCategories = () => files.map(f => getFileCategory(f.file));
  const allSameCategory = files.length > 0 && getFileCategories().every(category => category === getFileCategories()[0]);
  
  const canDownload = files.length > 0 && files.every((f) => f.converted);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = handleFileSelect(droppedFiles, files);
    
    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }
  }

  function handleManualSelect(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    const validFiles = handleFileSelect(selectedFiles, files);
    
    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }
    
    // ✅ Reset input value to allow selecting the same file again
    e.target.value = '';
  }

  function handleRemoveFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // ✅ Enhanced convert function with proper state synchronization
  async function handleConvert(item: UploadedFile, index: number) {
    try {
      // ✅ Set uploading state
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index 
            ? { 
                ...f, 
                loadingState: updateLoadingState(f.loadingState, 'uploading'),
                errorMessage: undefined // Clear any previous errors
              } 
            : f
        )
      );

      const data = await convertFileToCloudConvert(item);

      // ✅ Update to processing state
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index 
            ? { 
                ...f, 
                loadingState: updateLoadingState(f.loadingState, 'processing') 
              } 
            : f
        )
      );

      // ✅ Simulate converting stage
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index 
              ? { 
                  ...f, 
                  loadingState: updateLoadingState(f.loadingState, 'converting') 
                } 
              : f
          )
        );
      }, 400);

      // ✅ Simulate finishing stage
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index 
              ? { 
                  ...f, 
                  loadingState: updateLoadingState(f.loadingState, 'finishing') 
                } 
              : f
          )
        );
      }, 600);

      // ✅ Final completion with proper synchronization
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index
              ? {
                  ...f,
                  jobId: data.jobId,
                  downloadUrl: data.downloadUrl || '',
                  converted: !!data.downloadUrl,
                  convertedAt: new Date(),
                  // ✅ Only set to completed when file is actually ready
                  loadingState: data.downloadUrl 
                    ? updateLoadingState(f.loadingState, 'completed', 'Konversi berhasil!')
                    : updateLoadingState(f.loadingState, 'error', 'Tidak ada URL download'),
                }
              : f
          )
        );
      }, 800);

    } catch (error) {
      console.error('Conversion error:', error);
      
      // ✅ Enhanced error handling with specific messages
      const errorMessage = getErrorMessage(error instanceof Error ? error : 'CONVERSION_FAILED', {
        fileName: item.file.name,
        operation: 'convert'
      });

      // ✅ Update file with error state
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index 
            ? { 
                ...f, 
                loadingState: updateLoadingState(f.loadingState, 'error', errorMessage.message),
                errorMessage: errorMessage.message
              } 
            : f
        )
      );

      // ✅ Show error toast
      toast.error(errorMessage.title, {
        description: errorMessage.message,
        action: errorMessage.action ? {
          label: errorMessage.action,
          onClick: () => handleConvert(item, index), // Retry functionality
        } : undefined,
        duration: 5000,
      });
    }
  }

  // ✅ Enhanced convert all with better error tracking
  async function handleConvertAll() {
    const filesToConvert = files.filter(f => !f.converted && !f.loadingState.isLoading);
    
    if (filesToConvert.length === 0) {
      toast.warning('Tidak ada file yang perlu dikonversi', {
        description: 'Semua file sudah dikonversi atau sedang dalam proses.',
      });
      return;
    }

    // Show confirmation for large batches
    if (filesToConvert.length > 5) {
      const proceed = window.confirm(
        `Anda akan mengkonversi ${filesToConvert.length} file sekaligus. Lanjutkan?`
      );
      if (!proceed) return;
    }

    // Start conversion for all files
    const promises = filesToConvert.map(async (file, arrayIndex) => {
      const actualIndex = files.findIndex(f => f.file.name === file.file.name);
      if (actualIndex !== -1) {
        await handleConvert(file, actualIndex);
      }
    });

    // Show batch conversion started message
    toast.info(`Memulai konversi ${filesToConvert.length} file...`, {
      duration: 3000,
    });

    try {
      await Promise.allSettled(promises);
      
      // Show completion summary after a delay
      setTimeout(() => {
        const completed = files.filter(f => f.converted).length;
        const failed = files.filter(f => f.loadingState.stage === 'error').length;
        
        if (failed === 0) {
          toast.success(`Semua ${completed} file berhasil dikonversi!`);
        } else {
          toast.warning(`${completed} file berhasil, ${failed} file gagal dikonversi.`);
        }
      }, 2000);
      
    } catch (error) {
      toast.error('Terjadi kesalahan saat konversi batch', {
        description: 'Beberapa file mungkin gagal dikonversi.',
      });
    }
  }

  function resetFiles() {
    // ✅ Show confirmation if there are files being processed
    const processingFiles = files.filter(f => f.loadingState.isLoading);
    if (processingFiles.length > 0) {
      const proceed = window.confirm(
        `${processingFiles.length} file sedang diproses. Yakin ingin menghapus semua file?`
      );
      if (!proceed) return;
    }

    setFiles([]);
    toast.info('Semua file telah dihapus');
  }

  // ✅ Enhanced set all formats with validation
  function handleSetAllFormats(format: string) {
    const applicableFiles = files.filter(file => {
      const category = getFileCategory(file.file);
      // Check if the format is valid for this file category
      // This would need to be implemented in your file utils
      return true; // Simplified for now
    });

    if (applicableFiles.length === 0) {
      toast.warning('Format ini tidak dapat diterapkan ke file yang dipilih');
      return;
    }

    setFiles((prev) =>
      prev.map((f) => ({
        ...f,
        outputFormat: format
      }))
    );
    
    const message = applicableFiles.length === files.length
      ? `Semua file diset ke format .${format.toUpperCase()}`
      : `${applicableFiles.length} file diset ke format .${format.toUpperCase()}`;
      
    toast.success(message, {
      duration: 2000,
    });
  }

  // ✅ Add utility function to get conversion statistics
  function getConversionStats() {
    return {
      total: files.length,
      completed: files.filter(f => f.converted).length,
      processing: files.filter(f => f.loadingState.isLoading).length,
      failed: files.filter(f => f.loadingState.stage === 'error').length,
      pending: files.filter(f => f.loadingState.stage === 'idle').length,
    };
  }

  return {
    files,
    canDownload,
    setFiles,
    allSameCategory,
    handleDrop,
    handleManualSelect,
    handleRemoveFile,
    handleConvert,
    handleConvertAll,
    resetFiles,
    handleSetAllFormats,
    getConversionStats, // ✅ New utility
  };
}