'use client';

import { FILE_CATEGORIES } from '../lib/fileCategories';
import { File } from 'lucide-react';
import { getFileCategory } from '../lib/fileUtils';

type FileIconProps = {
  file: File;
  className?: string; // ✅ tambahkan
};

export function FileIcon({ file, className }: FileIconProps) {
  const category = getFileCategory(file);
  const Icon = FILE_CATEGORIES[category]?.icon;

  return Icon ? (
    <Icon className={className ?? 'w-12 h-12 text-gray-500'} />
  ) : (
    <File className={className ?? 'w-12 h-12 text-gray-400'} />
  );
}
