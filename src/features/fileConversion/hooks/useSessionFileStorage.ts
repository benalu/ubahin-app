// File: src/features/fileConversion/hooks/useSessionFileStorage.ts

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { UploadedFile } from '../type';
import { createLoadingState } from '../lib/loadingUtils';

const SESSION_KEY = 'ubahin_files_session';
const SESSION_EXPIRY = 60 * 60 * 1000; // 1 jam (seperti vert.sh)

// Interface untuk data yang disimpan di session storage
interface SessionFileData {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileLastModified: number;
  converted: boolean;
  downloadUrl?: string;
  outputFormat: string;
  jobId?: string;
  loadingState: any;
  convertedAt?: string;
  errorMessage?: string;
  previewUrl?: string;
}

interface SessionData {
  files: SessionFileData[];
  timestamp: number;
  version: string; // untuk handle breaking changes
}

export function useSessionFileStorage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isRestoring, setIsRestoring] = useState(true);
  const fileInputRef = useRef<File[]>([]);
  
  // Save files to session storage (seperti vert.sh)
  const saveToSession = useCallback((currentFiles: UploadedFile[]) => {
    if (typeof window === 'undefined') return;

    try {
      const sessionFiles: SessionFileData[] = currentFiles.map(f => ({
        fileName: f.file.name,
        fileSize: f.file.size,
        fileType: f.file.type,
        fileLastModified: f.file.lastModified,
        converted: f.converted,
        downloadUrl: f.downloadUrl,
        outputFormat: f.outputFormat,
        jobId: f.jobId,
        loadingState: f.loadingState,
        convertedAt: f.convertedAt?.toISOString(),
        errorMessage: f.errorMessage,
        previewUrl: f.previewUrl,
      }));

      const sessionData: SessionData = {
        files: sessionFiles,
        timestamp: Date.now(),
        version: '1.0.0',
      };

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } catch (error) {
      console.warn('Failed to save session:', error);
    }
  }, []);

  // Restore files dari session storage
  const restoreFromSession = useCallback(() => {
    if (typeof window === 'undefined') return [];

    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (!stored) return [];

      const sessionData: SessionData = JSON.parse(stored);
      
      // Check expiry (refresh browser = hapus session, seperti vert.sh)
      if (Date.now() - sessionData.timestamp > SESSION_EXPIRY) {
        sessionStorage.removeItem(SESSION_KEY);
        return [];
      }

      return sessionData.files;
    } catch (error) {
      console.warn('Failed to restore session:', error);
      sessionStorage.removeItem(SESSION_KEY);
      return [];
    }
  }, []);

  // Enhanced setFiles yang auto-save ke session
  const setFilesWithSession = useCallback((
    newFiles: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])
  ) => {
    setFiles(prevFiles => {
      const updatedFiles = typeof newFiles === 'function' ? newFiles(prevFiles) : newFiles;
      
      // Auto-save ke session storage (kecuali saat restoring)
      if (!isRestoring) {
        saveToSession(updatedFiles);
      }
      
      return updatedFiles;
    });
  }, [isRestoring, saveToSession]);

  // Handle file addition dengan session storage
  const addFiles = useCallback((newFiles: File[]) => {
    setFilesWithSession(prevFiles => {
      const validNewFiles: UploadedFile[] = newFiles
        .filter(file => !prevFiles.some(f => 
          f.file.name === file.name && f.file.size === file.size
        ))
        .map(file => ({
          previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          file,
          converted: false,
          downloadUrl: '',
          outputFormat: file.name.split('.').pop()?.toLowerCase() || 'pdf',
          loadingState: createLoadingState('idle'),
        }));

      return [...prevFiles, ...validNewFiles];
    });
  }, [setFilesWithSession]);

  // Remove file dengan session update
    const removeFile = useCallback((index: number) => {
      setFilesWithSession(prevFiles => {
        const fileToRemove = prevFiles[index];
        
        // ✅ Bersihkan preview URL jika ada
        if (fileToRemove?.previewUrl) {
          URL.revokeObjectURL(fileToRemove.previewUrl);
        }

        return prevFiles.filter((_, i) => i !== index);
      });
    }, [setFilesWithSession]);


  // Clear all files dan session
  const clearAllFiles = useCallback(() => {
    setFiles(prevFiles => {
      // ✅ Revoke semua preview URL
      prevFiles.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
      return [];
    });

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, []);

  // Update single file dengan session save
  const updateFile = useCallback((index: number, updates: Partial<UploadedFile>) => {
    setFilesWithSession(prevFiles =>
      prevFiles.map((file, i) =>
        i === index ? { ...file, ...updates } : file
      )
    );
  }, [setFilesWithSession]);

  // Restore files saat component mount
  useEffect(() => {
    const restoredFiles = restoreFromSession();
    
    if (restoredFiles.length > 0) {
      console.log(`🔄 Restoring ${restoredFiles.length} files from session`);
      
      // Convert session data back to UploadedFile format
      // Note: File objects tidak bisa disimpan di session storage,
      // jadi kita buat placeholder File objects
      const restoredUploadedFiles: UploadedFile[] = restoredFiles.map(sessionFile => ({
        file: new File([], sessionFile.fileName, {
          type: sessionFile.fileType,
          lastModified: sessionFile.fileLastModified,
        }),
        converted: sessionFile.converted,
        downloadUrl: sessionFile.downloadUrl || '',
        outputFormat: sessionFile.outputFormat,
        jobId: sessionFile.jobId,
        loadingState: sessionFile.loadingState,
        convertedAt: sessionFile.convertedAt ? new Date(sessionFile.convertedAt) : undefined,
        errorMessage: sessionFile.errorMessage,
        previewUrl: sessionFile.previewUrl,
      }));

      setFiles(restoredUploadedFiles);
    }
    
    setIsRestoring(false);
  }, [restoreFromSession]);

  // Clear session saat browser refresh (seperti vert.sh behavior)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Vert.sh menghapus session saat refresh, bukan saat close tab
      // Kita bisa customize behavior ini
      if (performance.navigation.type === 1) { // TYPE_RELOAD
        sessionStorage.removeItem(SESSION_KEY);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return {
    files,
    setFiles: setFilesWithSession,
    isRestoring,
    addFiles,
    removeFile,
    clearAllFiles,
    updateFile,
    hasSessionData: files.length > 0,
  };
}