// src/features/fileConversion/components/partials/FilePreview.tsx

import Image from 'next/image';
import {  getFileCategory } from '@/features/fileConversion/lib/fileUtils';
import { FileIcon } from '../FileIcon';

interface FilePreviewProps {
  file: File;
  className?: string;
}

export function FilePreview({ file, className }: FilePreviewProps) {
  const category = getFileCategory(file);

  if (category === 'image') {
    return (
      <Image
        src={URL.createObjectURL(file)}
        alt={file.name}
        width={300}
        height={180}
        className={className ?? 'object-contain max-h-full'}
      />
    );
  }

  // Untuk semua non-image (PDF, doc, zip, dll): tampilkan icon saja
  return <FileIcon file={file} className={className ?? 'w-12 h-12 text-muted-foreground'} />;
}
