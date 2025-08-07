// src/features/fileConversion/hooks/usePollingForJobStatus.ts

import { useEffect } from 'react';

interface UsePollingProps {
  jobId: string;
  onComplete: (downloadUrl: string) => void;
  intervalMs?: number;
  maxTries?: number;
}

export function usePollingForJobStatus({
  jobId,
  onComplete,
  intervalMs = 3000,
  maxTries = 60, // 3 menit
}: UsePollingProps) {
  useEffect(() => {
    if (!jobId) return;

    let tries = 0;
    const interval = setInterval(async () => {
      tries++;

      try {
        const res = await fetch(`/api/file-conversion/status?jobId=${jobId}`);
        const data = await res.json();

        if (data.status === 'finished') {
          clearInterval(interval);
          onComplete(data.downloadUrl);
        }

        if (tries >= maxTries) {
          clearInterval(interval);
          console.warn('Polling stopped: max attempts reached');
        }
      } catch (err) {
        clearInterval(interval);
        console.error('Polling failed:', err);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [jobId, onComplete, intervalMs, maxTries]);
}
