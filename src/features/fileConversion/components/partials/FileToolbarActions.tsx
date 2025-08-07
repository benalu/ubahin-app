// src/features/fileConversion/components/partials/FileToolbarActions.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Download, RefreshCcw, Trash2 } from 'lucide-react';

interface FileToolbarActionsProps {
  hasFiles: boolean;
  disabledDownload?: boolean;
  onConvertAll: () => void;
  onRemoveAll?: () => void;
}

export function FileToolbarActions({
  hasFiles,
  disabledDownload,
  onConvertAll,
  onRemoveAll,
}: FileToolbarActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      {/* Convert All */}
      <Button
        disabled={!hasFiles}
        onClick={onConvertAll}
        aria-label="Convert all files"
        className="bg-secondary text-white rounded-full px-4 py-6 flex items-center justify-center gap-2 shadow-md text-sm w-full sm:w-auto cursor-pointer hover:bg-secondary/90 transition-colors"
      >
        <RefreshCcw className="w-6 h-6" aria-hidden="true" />
        Convert all
      </Button>

      {/* Download All */}
      <Button
        disabled={disabledDownload}
        aria-label="Download all as zip"
        className={`rounded-full px-4 py-6 flex items-center justify-center gap-2 text-sm w-full sm:w-auto ${
          disabledDownload
            ? 'bg-muted-foreground text-white opacity-50 cursor-not-allowed'
            : 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
        }`}
      >
        <Download className="w-6 h-6" aria-hidden="true" />
        Download all as .zip
      </Button>

      {/* Remove All */}
      <Button
        disabled={!hasFiles}
        onClick={onRemoveAll}
        aria-label="Remove all files"
        className="bg-muted-foreground text-white rounded-full px-4 py-6 flex items-center justify-center gap-2 text-sm w-full sm:w-auto hover:bg-red-400 cursor-pointer"
      >
        <Trash2 className="w-6 h-6" aria-hidden="true" />
        <span className="sm:hidden">Remove All Files</span>
        <span className="hidden sm:inline">Remove All</span>
      </Button>
    </div>
  );
}
