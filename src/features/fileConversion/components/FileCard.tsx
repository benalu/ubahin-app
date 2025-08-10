// src/features/fileConversion/components/FileCard.tsx
'use client';

import { Button } from '@/components/ui/button';
import { X, RefreshCcw, Download } from 'lucide-react';
import { FormatDropdown } from '../components/partials/FormatDropdown';
import { LoadingProgress } from './partials/LoadingProgress';
import type { UploadedFile } from '../../../types/type';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FilePreviewProps } from './partials/FilePreview';

const FilePreview = dynamic(() => import('./partials/FilePreview'), {
  ssr: false,
  loading: () => <div className="text-xs text-muted-foreground">Loading preview...</div>,
}) as React.ComponentType<FilePreviewProps>;

interface FileCardProps {
  item: UploadedFile;
  index: number;
  onRemove: (index: number) => void;
  onConvert: (item: UploadedFile, index: number) => void;
  onFormatChange: (index: number, format: string) => void;
}

export default function FileCard({
  item,
  index,
  onRemove,
  onConvert,
  onFormatChange,
}: FileCardProps) {
  // ✅ State untuk download animation
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const handleDownload = async () => {
    if (!item.downloadUrl) return;

    const originalName = item.file.name;
    const ext = item.outputFormat || originalName.split('.').pop() || 'file';
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const customName = `Ubahin_${baseName}.${ext}`;

    try {
      // ✅ Set downloading state
      setIsDownloading(true);
      setDownloadComplete(false);

      const response = await fetch(item.downloadUrl);
      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = customName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      // ✅ Show download complete animation
      setIsDownloading(false);
      setDownloadComplete(true);

      // ✅ Show success toast when download starts
      toast.success('File berhasil diunduh!', {
        description: `${customName} telah tersimpan ke folder Downloads`,
        duration: 3000,
      });

      // ✅ Keep download complete state permanent (don't reset)
      // setTimeout(() => {
      //   setDownloadComplete(false);
      // }, 3000);

    } catch (error) {
      console.error('Download error:', error);
      
      // ✅ Reset states on error
      setIsDownloading(false);
      setDownloadComplete(false);
      
      // ✅ Show error toast if download fails
      toast.error('Gagal mengunduh file', {
        description: 'Terjadi kesalahan saat mengunduh file. Silakan coba lagi.',
        duration: 4000,
      });
    }
  };

  return (
    <div className="relative bg-muted rounded-xl p-4 shadow flex flex-col justify-between">
      {/* Remove Button (pojok kanan atas) */}
      <div className="absolute top-2 right-2 z-10">
        <button 
          onClick={() => onRemove(index)} 
          className="text-gray-400 hover:text-red-500 transition-colors duration-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ✅ File name (pindah ke atas) */}
      <div className="text-sm font-medium text-muted-foreground line-clamp-1 mb-3 pr-8">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-default">{item.file.name}</span>
          </TooltipTrigger>
          <TooltipContent>{item.file.name}</TooltipContent>
        </Tooltip>
      </div>

      {/* Preview */}
      <div className="w-full h-[180px] bg-white rounded-md overflow-hidden flex items-center justify-center mb-3">
        <FilePreview file={item.file} previewUrl={item.previewUrl} />
      </div>

      {/* ✅ Loading Progress with Download Override */}
      <div className="relative">
        <LoadingProgress
          loadingState={item.loadingState}
          fileName={item.file.name}
        />
        
        {/* ✅ Compact Download Animation Overlay */}
        {(isDownloading || downloadComplete) && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-center animate-in fade-in duration-300">
            {isDownloading ? (
              <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                <Download className="w-4 h-4 text-blue-500 animate-bounce" />
                <div className="flex flex-col">
                  <div className="text-xs font-medium text-blue-700">Mengunduh...</div>
                  <div className="w-16 bg-blue-200 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-pulse rounded-full"></div>
                  </div>
                </div>
              </div>
            ) : downloadComplete ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                  <Download className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <div className="text-sm font-semibold text-emerald-700 flex items-center gap-1">
                    File berhasil diunduh! <span className="text-emerald-500">✓</span>
                  </div>
                  <div className="text-[11px] text-emerald-600">Tersimpan di folder Downloads</div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Format Dropdown + Buttons */}
      <div className="flex items-center justify-between mt-4">
        <FormatDropdown
          file={item.file}
          selected={item.outputFormat}
          onChange={(format) => onFormatChange(index, format)}
        />

        <div className="flex items-center gap-2">
          {/* Convert Button */}
          <Button
            size="icon"
            title='Konversi file'
            disabled={item.loadingState.isLoading}
            className={`text-white cursor-pointer rounded-full transition-colors duration-200 ${
              item.loadingState.isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-secondary hover:bg-gray-600'
            }`}
            onClick={() => onConvert(item, index)}
          >
            <RefreshCcw className={`w-4 h-4 ${item.loadingState.isLoading ? 'animate-spin' : ''}`} />
          </Button>

          {/* Download Button */}
          <Button
            size="icon"
            title='Unduh file'
            disabled={!item.converted || isDownloading || downloadComplete}
            className={`text-white cursor-pointer rounded-full transition-all duration-200 ${
              downloadComplete
                ? 'bg-emerald-500 scale-105 shadow-md cursor-not-allowed'
                : isDownloading
                ? 'bg-blue-500 animate-pulse cursor-not-allowed'
                : item.converted
                ? 'bg-emerald-600 hover:bg-emerald-700 hover:scale-105'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            onClick={handleDownload}
          >
            {downloadComplete ? (
              <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                <span className="text-emerald-500 text-xs font-bold">✓</span>
              </div>
            ) : (
              <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}