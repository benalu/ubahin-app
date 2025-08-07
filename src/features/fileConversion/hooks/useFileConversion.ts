// src/features/fileConversion/hooks/useFileConversion.ts
'use client';

import { useState, DragEvent, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { handleFileSelect } from '../lib/handleFileSelect';
import { convertFileToCloudConvert } from '../lib/apiUtils';
import { getFileCategory } from '../lib/fileUtils';
import type { UploadedFile } from '../type';

export function useFileConversion() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  
  // ✅ Changed logic: check if all files are in the same CATEGORY (not extension)
  const getFileCategories = () => files.map(f => getFileCategory(f.file));
  const allSameCategory = files.length > 0 && getFileCategories().every(category => category === getFileCategories()[0]);
  
  const canDownload = files.length > 0 && files.every((f) => f.converted);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = handleFileSelect(droppedFiles, files);
    setFiles((prev) => [...prev, ...validFiles]);
  }

  function handleManualSelect(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    const validFiles = handleFileSelect(selectedFiles, files);
    setFiles((prev) => [...prev, ...validFiles]);
  }

  function handleRemoveFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleConvert(item: UploadedFile, index: number) {
    // ✅ Tampilkan status "sedang dikonversi"
    setFiles((prev) =>
      prev.map((f, i) =>
        i === index ? { ...f, isConverting: true } : f
      )
    );

    try {
      const data = await convertFileToCloudConvert(item);

      // ✅ Beri delay agar animasi progress terlihat meskipun file kecil
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index
              ? {
                  ...f,
                  jobId: data.jobId,
                  downloadUrl: data.downloadUrl || '',
                  converted: true,
                  isConverting: false,
                }
              : f
          )
        );
      }, 600);
    } catch (err) {
      toast.error('Gagal mengonversi file.');
      // ✅ Matikan status konversi jika gagal
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, isConverting: false } : f
        )
      );
    }
  }

  function handleConvertAll() {
    files.forEach((file, index) => handleConvert(file, index));
  }

  function resetFiles() {
    setFiles([]);
  }

  // ✅ New function to set all files to the same output format
  function handleSetAllFormats(format: string) {
    setFiles((prev) =>
      prev.map((f) => ({
        ...f,
        outputFormat: format
      }))
    );
    toast.success(`All files set to .${format.toUpperCase()} format`);
  }

  return {
    files,
    canDownload,
    setFiles,
    allSameCategory, // ✅ Changed from allSameExtension to allSameCategory
    handleDrop,
    handleManualSelect,
    handleRemoveFile,
    handleConvert,
    handleConvertAll,
    resetFiles,
    handleSetAllFormats,
  };
}