// src/hooks/useFilePreviewCache.ts
// Global cache untuk file previews yang persisten

'use client';

import { useEffect, useRef } from 'react';

interface PreviewCacheItem {
  objectUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  lastModified: number;
  createdAt: number;
}

// Global cache untuk previews
const previewCache = new Map<string, PreviewCacheItem>();

// Cleanup previews yang terlalu lama (1 jam)
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 jam

function cleanupExpiredPreviews() {
  const now = Date.now();
  const toRemove: string[] = [];
  
  previewCache.forEach((item, key) => {
    if (now - item.createdAt > CACHE_EXPIRY) {
      URL.revokeObjectURL(item.objectUrl);
      toRemove.push(key);
    }
  });
  
  toRemove.forEach(key => previewCache.delete(key));
}

// Generate unique key untuk file
function getFileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function useFilePreviewCache() {
  const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Setup periodic cleanup
    cleanupTimerRef.current = setInterval(cleanupExpiredPreviews, 5 * 60 * 1000); // Setiap 5 menit

    return () => {
      if (cleanupTimerRef.current) {
        clearInterval(cleanupTimerRef.current);
      }
    };
  }, []);

  const createOrGetPreview = (file: File): string | null => {
    // Jika file kosong (dari session restore), return null
    if (file.size === 0) {
      return null;
    }

    const key = getFileKey(file);
    const existing = previewCache.get(key);
    
    // Jika ada cache yang valid, gunakan itu
    if (existing) {
      return existing.objectUrl;
    }
    
    // Buat preview baru hanya untuk file gambar
    if (file.type.startsWith('image/')) {
      try {
        const objectUrl = URL.createObjectURL(file);
        const cacheItem: PreviewCacheItem = {
          objectUrl,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          lastModified: file.lastModified,
          createdAt: Date.now(),
        };
        
        previewCache.set(key, cacheItem);
        return objectUrl;
      } catch (error) {
        console.error('Failed to create object URL:', error);
        return null;
      }
    }
    
    return null;
  };

  const removePreview = (file: File) => {
    const key = getFileKey(file);
    const cached = previewCache.get(key);
    
    if (cached) {
      URL.revokeObjectURL(cached.objectUrl);
      previewCache.delete(key);
    }
  };

  const clearAllPreviews = () => {
    previewCache.forEach(item => {
      URL.revokeObjectURL(item.objectUrl);
    });
    previewCache.clear();
  };

  return {
    createOrGetPreview,
    removePreview,
    clearAllPreviews,
  };
}