// src/features/fileConversion/components/partials/FilePreview.tsx

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getFileCategory } from '@/features/fileConversion/lib/fileUtils';
import { FileIcon } from '../FileIcon';

interface FilePreviewProps {
  file: File;
  className?: string;
}

export function FilePreview({ file, className }: FilePreviewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const category = getFileCategory(file);

  // ✅ Proper cleanup for object URLs
  useEffect(() => {
    if (category === 'image') {
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);

      // ✅ Cleanup function to prevent memory leaks
      return () => {
        URL.revokeObjectURL(objectUrl);
        setImageUrl(null);
      };
    }
  }, [file, category]);

  // ✅ Handle image loading errors
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
        // ✅ Add loading placeholder
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
    );
  }

  // ✅ For all non-image files: show icon
  return (
    <FileIcon 
      file={file} 
      className={className ?? 'w-12 h-12 text-muted-foreground'} 
    />
  );
}