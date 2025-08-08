// src/features/fileConversion/components/partials/FilePreview.tsx

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getFileCategory } from '@/features/fileConversion/lib/fileUtils';
import { FileIcon } from '../FileIcon';

export interface FilePreviewProps {
  file: File;
  previewUrl?: string;
  className?: string;
}

export default function FilePreview({ file, previewUrl, className }: FilePreviewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(previewUrl ?? null);
  const category = getFileCategory(file);

  useEffect(() => {
    if (!previewUrl && category === 'image') {
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
        setImageUrl(null);
      };
    }
  }, [file, previewUrl, category]);

  const handleImageError = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    }
  };

  if (category === 'image' && imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={file.name}
        width={300}
        height={180}
        className={className ?? 'object-contain max-h-full'}
        onError={handleImageError}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYI..."
      />
    );
  }

  return (
    <FileIcon 
      file={file} 
      className={className ?? 'w-12 h-12 text-muted-foreground'} 
    />
  );
}