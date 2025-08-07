// src/features/fileConversion/components/partials/PollingHandler.tsx
/**
 * Komponen ini hanya dipakai jika file belum punya downloadUrl.
 * Idealnya tidak aktif di hybrid system kecuali ada delay dari CloudConvert.
 * 
 * Aman dinonaktifkan di masa depan jika sistem selalu memberikan downloadUrl langsung.
 */

'use client';

import { usePollingForJobStatus } from '@/features/fileConversion/hooks/usePollingForJobStatus';
import { useEffect, useState } from 'react';
import type { UploadedFile } from '@/features/fileConversion/type';

interface PollingHandlerProps {
  item: UploadedFile;
  index: number;
  jobId: string;
  onUpdate: (index: number, downloadUrl: string) => void;
}

export function PollingHandler({ item, index, jobId, onUpdate }: PollingHandlerProps) {
  const [status, setStatus] = useState<'polling' | 'done' | 'timeout'>('polling');

  usePollingForJobStatus({
    jobId,
    onComplete: (url) => {
      setStatus('done');
      onUpdate(index, url);
    },
    maxTries: 60,
    intervalMs: 3000,
    // Bisa tambahkan opsi error handling nanti
  });

  if (status === 'done') return null;

  return (
    <div className="text-sm mt-3 text-muted-foreground">
      {status === 'polling' ? (
        <span className="animate-pulse">⏳ Menunggu konversi file selesai...</span>
      ) : (
        <span className="text-red-500">❌ Gagal mengonversi file.</span>
      )}
    </div>
  );
}

