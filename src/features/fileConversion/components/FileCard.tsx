// src/features/fileConversion/components/FileCard.tsx

'use client';

import { Button } from '@/components/ui/button';
import { X, RefreshCcw, Download } from 'lucide-react';
import { FormatDropdown } from '../components/partials/FormatDropdown';
import { FilePreview } from './partials/FilePreview';
import type { UploadedFile } from '../type';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  const isConverting = item.isConverting;

  return (
    <div className="relative bg-muted rounded-xl p-4 shadow flex flex-col justify-between">
      {/* Top Bar: Progress or Filename + X */}
      <div className="relative h-5 mb-2 flex items-center justify-between text-sm font-medium">
        <div className="flex-1 overflow-hidden">
          {isConverting ? (
            <div className="w-full h-2 bg-muted-foreground/10 overflow-hidden rounded-md relative">
              <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-secondary to-cyan-500 animate-pingpong rounded-md" />
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="line-clamp-1 cursor-default">{item.file.name}</span>
              </TooltipTrigger>
              <TooltipContent
                
                >
                {item.file.name}
                
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <button onClick={() => onRemove(index)} className="ml-2 z-10">
          <X className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
        </button>
      </div>

      {/* Preview */}
      <div className="w-full h-[180px] bg-white rounded-md overflow-hidden flex items-center justify-center mb-4">
        <FilePreview file={item.file} />
      </div>

      {/* Bottom: Format + Buttons */}
      <div className="flex items-center justify-between">
        <FormatDropdown
          file={item.file}
          selected={item.outputFormat}
          onChange={(format) => onFormatChange(index, format)}
        />

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            className="bg-secondary text-white cursor-pointer rounded-full hover:bg-gray-600 transition-colors"
            onClick={() => onConvert(item, index)}
          >
            <RefreshCcw className="w-8 h-8" />
          </Button>

          <Button
            size="icon"
            disabled={!item.converted}
            className={`text-white cursor-pointer rounded-full hover:bg-secondary/80 ${
              item.converted
                ? 'bg-emerald-600 hover:bg-gray-600'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            onClick={async () => {
              if (!item.downloadUrl) return;

              const originalName = item.file.name;
              const ext = item.outputFormat || originalName.split('.').pop() || 'file';
              const baseName = originalName.replace(/\.[^/.]+$/, '');
              const customName = `Ubahin_${baseName}.${ext}`;

              try {
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
              } catch (error) {
                console.error('Download error:', error);
              }
            }}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
