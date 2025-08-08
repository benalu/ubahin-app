// File: src/features/fileConversion/components/SessionIndicator.tsx

'use client';

import { useEffect, useState } from 'react';
import { Clock, Database } from 'lucide-react';

interface SessionIndicatorProps {
  fileCount: number;
  isRestoring: boolean;
}

export function SessionIndicator({ fileCount, isRestoring }: SessionIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (fileCount > 0) {
      setShowIndicator(true);
      const timer = setTimeout(() => setShowIndicator(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [fileCount]);

  if (!showIndicator || fileCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-secondary/10 backdrop-blur-md border border-secondary/20 rounded-lg px-3 py-2 text-sm text-secondary flex items-center gap-2 z-50">
      {isRestoring ? (
        <>
          <Database className="w-4 h-4 animate-pulse" />
          <span>Memulihkan {fileCount} file dari sesi sebelumnya...</span>
        </>
      ) : (
        <>
          <Clock className="w-4 h-4" />
          <span>Session aktif • {fileCount} file tersimpan</span>
        </>
      )}
    </div>
  );
}